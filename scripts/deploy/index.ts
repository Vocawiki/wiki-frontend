import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { MediaWikiApi, type FexiosFinalContext, type MwApiResponse } from 'wiki-saikou'

import { getPageTitleFromFileName } from '../utils/page'
import { deploymentStateSchema } from './types'

const DEPLOYMENT_STATE_PAGE_TITLE = 'MediaWiki:Deployment.json'

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
	const commitSHA = args['commit-sha'] ?? process.env.GITHUB_SHA
	assert(commitSHA, '必须提供 commit SHA')

	await deployPages(await getBuiltPages(), { ...args, commitSHA, runId: process.env.GITHUB_RUN_ID })
}
interface Page {
	title: string
	content: string
	sha: string
}
async function deployPages(
	pages: Page[],
	{ summary, commitSHA, runId }: { summary: string; commitSHA: string; runId?: string },
) {
	const deployStartedAt = new Date()
	const api = await getAPI()

	// 获取[[MediaWiki:Deployment.json]]的内容
	const result: FexiosFinalContext<
		MwApiResponse<{
			query: {
				pages: [
					{
						pageid: number
						ns: 8
						title: typeof DEPLOYMENT_STATE_PAGE_TITLE
						revisions: [
							{
								slots: {
									main: {
										contentmodel: 'json'
										contentformat: 'application/json'
										content: string
									}
								}
							},
						]
					},
				]
			}
		}>
	> = await api.get({
		action: 'query',
		format: 'json',
		formatversion: 2,
		prop: 'revisions',
		titles: DEPLOYMENT_STATE_PAGE_TITLE,
		rvprop: 'content',
		rvslots: 'main',
		rvlimit: 1,
	}) // WikiSaikou的泛型坏了，`api.get`的泛型是`T`，返回值里不知道哪来的`T_1`
	const deploymentState = deploymentStateSchema.parse(
		JSON.parse(result.data.query.pages[0].revisions[0].slots.main.content),
	)
	const deployedPages = deploymentState.pages

	for (const page of pages) {
		if (page.sha === deployedPages[page.title]) {
			continue
		}
		await deployPage(api, page, summary)
	}

	const deployFinishedAt = new Date()
	const newDeploymentState = deploymentStateSchema.encode({
		version: 1,
		pages: Object.fromEntries(pages.map((page) => [page.title, page.sha])),
		commitSHA,
		runId,
		deployStartedAt,
		deployFinishedAt,
	})

	await api.postWithEditToken({
		action: 'edit',
		title: 'MediaWiki:Deployment.json',
		text: JSON.stringify(newDeploymentState, null, 2),
		summary: `更新部署状态（commit SHA：${commitSHA}${runId ? `；run ID：${runId}` : ''}）`,
		tags: 'Bot',
		notminor: true,
		bot: true,
	})
}

async function getAPI() {
	const { DEPLOY_USERNAME: username, DEPLOY_PASSWORD: password } = process.env
	assert(username && password, '环境变量中需要有用户名和密码')

	const api = new MediaWikiApi({
		baseURL: 'https://voca.wiki/api.php',
		defaultParams: { action: 'query', format: 'json', formatversion: 2 },
		throwOnApiError: true,
	})
	await api.login(username, password)
	return api
}

async function getPageContentSHA1(content: string): Promise<string> {
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
				sha: await getPageContentSHA1(pageContent),
			}
		}),
	)
}

async function deployPage(api: MediaWikiApi, page: Page, summary: string) {
	await api.postWithEditToken({
		action: 'edit',
		title: page.title,
		text: page.content,
		summary,
		tags: 'Bot',
		notminor: true,
		bot: true,
	})
}
