import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { convertPathToPattern, globby } from 'globby'
import pMap from 'p-map'
import PQueue from 'p-queue'
import type { MediaWikiApi } from 'wiki-saikou'

import { toSorted } from '@/lib/record'
import { loadReferencedFiles } from '@/tools/file-usage'

import { ASSETS_BASE_URL, ASSETS_DIR_IN_OUTPUT_DIR, PAGES_DIR } from '../config'
import { getPageTitleFromFileName } from '../utils/page'
import {
	deletePage,
	deployPage,
	getApi,
	getDeployState,
	lockDeploymentState,
	unlockDeploymentState,
} from './api'
import { deployCloudflareWorker } from './cloudflare'
import { DEPLOYMENT_STATE_PAGE_TITLE } from './config'
import { deploymentSpecifier } from './message'
import { comparePath, compareTitle } from './sorter'
import {
	deploymentStateSchema,
	type DeploymentContext,
	type DeploymentState,
	type DeploymentTrash,
	type Page,
} from './types'

const Instant = Temporal.Instant

const { values: args } = parseArgs({
	args: Bun.argv,
	options: {
		summary: {
			type: 'string',
			default: '推送构建后的代码',
		},
		'commit-sha': {
			type: 'string',
		},
		help: {
			type: 'boolean',
			short: 'h',
		},
	},
	strict: true,
	allowPositionals: true,
})

if (args.help) {
	console.log('参数:')
	console.log('      --summary <val>     编辑摘要')
	console.log('      --commit-sha <val>  commit SHA')
	console.log('  -h, --help              显示帮助')
} else {
	const commitSha = args['commit-sha'] ?? process.env.GITHUB_SHA
	assert(commitSha, '必须提供 commit SHA')

	await deploy(await getBuiltPages(), { ...args, commitSha, runId: process.env.GITHUB_RUN_ID })
}

async function deploy(pages: Page[], ctx: DeploymentContext) {
	const deployStartedAt = Temporal.Now.instant()
	const api = await getApi()
	const previousDeploymentState = await getDeployState(api)
	if (previousDeploymentState.lockedBy !== undefined) {
		throw new Error(`有进程正在部署，上锁者：${previousDeploymentState.lockedBy}`)
	}

	await lockDeploymentState(api, ctx, previousDeploymentState)

	try {
		const assetsState = await deployCloudflareWorker(ctx, previousDeploymentState)
		const workerDeployFinishedAt = Temporal.Now.instant()
		await deployWikiPages(api, ctx, previousDeploymentState, pages)
		const deployFinishedAt = Temporal.Now.instant()

		const newTrashState = await cleanTrash(
			api,
			ctx,
			previousDeploymentState,
			pages,
			deployFinishedAt,
		)
		const cleanFinishedAt = Temporal.Now.instant()

		const newDeploymentState = deploymentStateSchema.encode({
			version: 3,
			pages: Object.fromEntries(
				pages
					.map((page) => [page.title, page.sha1] as const)
					.toSorted(([titleA], [titleB]) => compareTitle(titleA, titleB)),
			),
			assets: {
				active: toSorted(assetsState.active, ([pathA], [pathB]) => comparePath(pathA, pathB)),
				obsolete: toSorted(assetsState.obsolete, ([pathA], [pathB]) => comparePath(pathA, pathB)),
			},
			workerDeployFinishedAt,
			referencedFiles: await loadReferencedFiles(),
			trash: newTrashState,
			commitSha: ctx.commitSha,
			runId: ctx.runId,
			deployStartedAt,
			deployFinishedAt,
			cleanFinishedAt,
		})

		await api.postWithEditToken({
			action: 'edit',
			title: DEPLOYMENT_STATE_PAGE_TITLE,
			text: JSON.stringify(newDeploymentState, null, '\t'),
			summary: '部署完成' + deploymentSpecifier(ctx),
			tags: 'Bot',
			notminor: true,
			bot: true,
		})
	} catch (err) {
		await unlockDeploymentState(api, ctx, previousDeploymentState)
		throw err
	}
}

async function deployWikiPages(
	api: MediaWikiApi,
	ctx: DeploymentContext,
	previousDeploymentState: DeploymentState,
	pages: Page[],
) {
	const previousPages = previousDeploymentState.pages
	const deployQueue = new PQueue({ concurrency: 2 })
	await deployQueue.addAll(
		pages
			.filter(({ title, sha1 }) => sha1 !== previousPages[title])
			.map((page) => () => deployPage(api, ctx, page)),
	)
}

async function cleanTrash(
	api: MediaWikiApi,
	ctx: DeploymentContext,
	previousDeploymentState: DeploymentState,
	pages: Page[],
	deployFinishedAt: Temporal.Instant,
): Promise<DeploymentTrash> {
	const { newTrashState, pagesToDelete } = toNewTrashState(previousDeploymentState.trash, {
		previousTitles: Object.keys(previousDeploymentState.pages),
		currentTitles: pages.map(({ title }) => title),
		deployFinishedAt,
	})
	const cleanQueue = new PQueue({ concurrency: 1 })
	await cleanQueue.addAll(pagesToDelete.map((title) => () => deletePage(api, ctx, title)))

	return newTrashState
}

function toNewTrashState(
	previousState: DeploymentTrash,
	{
		previousTitles,
		currentTitles,
		deployFinishedAt,
	}: {
		previousTitles: string[]
		currentTitles: string[]
		deployFinishedAt: Temporal.Instant
	},
): {
	newTrashState: DeploymentTrash
	pagesToDelete: string[]
} {
	const trash = new Map(previousState)
	previousTitles.forEach((title) => trash.set(title, deployFinishedAt))
	currentTitles.forEach((title) => trash.delete(title))
	const earliestInstantToPreserve = Temporal.Now.instant().add({ hours: -7 * 24 }) // 清理超过7天的垃圾
	const pagesToDelete = []
	for (const [title, dateAdded] of trash.entries()) {
		if (Instant.compare(dateAdded, earliestInstantToPreserve) > 0) {
			break
		}
		pagesToDelete.push(title)
		trash.delete(title)
	}

	return {
		newTrashState: trash,
		pagesToDelete,
	}
}

async function getPageContentSha1(content: string): Promise<string> {
	const bytes = new TextEncoder().encode(content)
	const hashBuffer = await crypto.subtle.digest('SHA-1', bytes)
	const hashHex = new Uint8Array(hashBuffer).toHex()
	return hashHex
}

async function getBuiltPages(): Promise<Page[]> {
	const directory = convertPathToPattern(PAGES_DIR)
	const entries = await globby([`${directory}/*`, `!${directory}/*.map`], { stats: true })
	return pMap(entries, async (entry) => {
		const title = getPageTitleFromFileName(entry.name)
		const contentWithSourceMapComment = await readFile(join(entry.path, entry.name), 'utf-8')
		const content = contentWithSourceMapComment
			.replace(/\n\/\/# sourceMappingURL=.+/, '')
			.replaceAll(`../${ASSETS_DIR_IN_OUTPUT_DIR}`, ASSETS_BASE_URL)
		return {
			title,
			content,
			sha1: await getPageContentSha1(content),
		}
	})
}
