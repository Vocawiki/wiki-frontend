import 'temporal-polyfill/global'

import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import PQueue from 'p-queue'
import type { MediaWikiApi } from 'wiki-saikou'

import { loadReferencedFiles } from '@/tools/file-usage'

import { getPageTitleFromFileName } from '../utils/page'
import {
	deletePage,
	deployPage,
	getApi,
	getDeployState,
	lockDeploymentState,
	unlockDeploymentState,
} from './api'
import { DEPLOYMENT_STATE_PAGE_TITLE } from './config'
import { deploymentSpecifier } from './message'
import { compareTitle } from './sorter'
import {
	deploymentStateSchemaV2,
	type DeploymentContext,
	type DeploymentStateV2,
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
		throw new Error('有进程正在部署')
	}

	await lockDeploymentState(api, ctx, previousDeploymentState)

	try {
		await deployPages(api, ctx, previousDeploymentState, pages)
		const deployFinishedAt = Temporal.Now.instant()

		const newTrashState = await cleanTrash(
			api,
			ctx,
			previousDeploymentState,
			pages,
			deployFinishedAt,
		)
		const cleanFinishedAt = Temporal.Now.instant()

		const newDeploymentState = deploymentStateSchemaV2.encode({
			version: 2,
			pages: Object.fromEntries(
				pages
					.map((page) => [page.title, page.sha1] as const)
					.toSorted(([titleA], [titleB]) => compareTitle(titleA, titleB)),
			),
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
			text: JSON.stringify(newDeploymentState, null, 2),
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

async function deployPages(
	api: MediaWikiApi,
	ctx: DeploymentContext,
	previousDeploymentState: DeploymentStateV2,
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
	previousDeploymentState: DeploymentStateV2,
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
	const encoder = new TextEncoder()
	const data = encoder.encode(content)
	const hashBuffer = await crypto.subtle.digest('SHA-1', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
	return hashHex
}

async function getBuiltPages(): Promise<Page[]> {
	const entries = await readdir('out/pages', { withFileTypes: true })
	return Promise.all(
		entries.map(async (entry) => {
			assert(entry.isFile(), 'out/pages出现了不是文件的' + entry.name)

			const pageTitle = getPageTitleFromFileName(entry.name)
			const pageContent = await Bun.file(join(entry.parentPath, entry.name)).text()
			return {
				title: pageTitle,
				content: pageContent,
				sha1: await getPageContentSha1(pageContent),
			}
		}),
	)
}
