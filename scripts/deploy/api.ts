import assert from 'node:assert/strict'

import { MediaWikiApi, type FexiosFinalContext, type MwApiResponse } from 'wiki-saikou'

import { REPO_NAME, WIKI_API_URL } from '../config'
import { DEPLOYMENT_STATE_PAGE_TITLE } from './config'
import { deploymentSpecifier } from './message'
import { migrateFromV1ToV2 } from './migrate'
import {
	type Page,
	type DeploymentContext,
	deploymentStateSchemaV2,
	type DeploymentStateV2,
	type DeploymentStateStorageV1,
	type DeploymentStateStorageV2,
} from './types'

function prettyJsonStringify(value: any) {
	return JSON.stringify(value, undefined, 2)
}

export async function getApi() {
	const { DEPLOY_USERNAME: username, DEPLOY_PASSWORD: password } = process.env
	assert(username && password, '环境变量中需要有用户名和密码')

	const api = new MediaWikiApi({
		baseURL: WIKI_API_URL,
		defaultParams: { action: 'query', format: 'json', formatversion: 2 },
		throwOnApiError: true,
	})
	await api.login(username, password)
	return api
}

export async function getDeployState(api: MediaWikiApi) {
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
	})
	let raw = JSON.parse(result.data.query.pages[0].revisions[0].slots.main.content) as
		| DeploymentStateStorageV1
		| DeploymentStateStorageV2
	if (raw.version === 1) {
		raw = migrateFromV1ToV2(raw)
	}

	return deploymentStateSchemaV2.parse(raw)
}

export async function lockDeploymentState(
	api: MediaWikiApi,
	ctx: DeploymentContext,
	previousState: DeploymentStateV2,
) {
	await api.postWithEditToken({
		action: 'edit',
		title: DEPLOYMENT_STATE_PAGE_TITLE,
		text: prettyJsonStringify(
			deploymentStateSchemaV2.encode({
				...previousState,
				lockedBy: ctx.runId ? `run:${ctx.runId}` : `commit:${ctx.commitSha}`,
			}),
		),
		summary: '开始部署' + deploymentSpecifier(ctx),
		tags: 'Bot',
		minor: true,
		bot: true,
	})
}

export async function unlockDeploymentState(
	api: MediaWikiApi,
	ctx: DeploymentContext,
	previousState: DeploymentStateV2,
) {
	await api.postWithEditToken({
		action: 'edit',
		title: DEPLOYMENT_STATE_PAGE_TITLE,
		text: prettyJsonStringify(deploymentStateSchemaV2.encode(previousState)),
		summary: '部署失败，解除锁定' + deploymentSpecifier(ctx),
		tags: 'Bot',
		minor: true,
		bot: true,
	})
}

export async function deployPage(api: MediaWikiApi, { summary }: DeploymentContext, page: Page) {
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

export async function deletePage(api: MediaWikiApi, { runId }: DeploymentContext, title: string) {
	const reason = `超过7天的无用页面${
		runId ? `（本次任务：[[git:${REPO_NAME}/actions/runs/${runId}|${runId}]]）` : ''
	}`
	await api.postWithEditToken({
		action: 'delete',
		title,
		reason,
	})
}
