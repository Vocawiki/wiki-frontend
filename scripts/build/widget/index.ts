import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'

import pMap from 'p-map'
import type { ReactNode } from 'react'

import { getFileInfo } from '@/scripts/utils/file-info'
import { writeBuiltPage } from '@/scripts/utils/page'
import type { WidgetMeta } from '@/tools/widget'

import { compileComponent } from '../compilers'
import { compileJS } from '../compilers/js-compiler'
import type { ScriptBuildEntry } from '../types'
import { findCodeEntries } from '../utils/code-entry'
import {
	toWidgetWikiContent,
	formatScriptWidgetBanner,
	SCRIPT_WIDGET_FOOTER,
} from './widget-template'

export async function buildWidgets(options: {
	onScriptEntryFound: (entry: ScriptBuildEntry) => void
}) {
	const widgetEntries = await findWidgets('src/widgets')
	await Promise.all(widgetEntries.map((entity) => buildWidget(entity, options)))
}

interface WidgetSourceInfo {
	name: string
	path: string
	entryFileName: string
	meta: WidgetMeta
}

/**
 * 查找 dir 下的 index.xx 文件
 * @returns 文件名
 */
async function findIndexFile(dir: string): Promise<string> {
	for (const x of await readdir(dir, { withFileTypes: true })) {
		if (x.isFile() && getFileInfo(x.name).baseName === 'index') {
			return x.name
		}
	}
	throw new Error(`${dir}下不存在入口文件`)
}

async function findWidgets(dir: string): Promise<WidgetSourceInfo[]> {
	const entries = await findCodeEntries(dir)
	return pMap(entries, async ({ name, path }): Promise<WidgetSourceInfo> => {
		const [entryFileName, meta] = await Promise.all([
			findIndexFile(path),
			import(`@/${path}/(meta)`).then((x) => (x as { default: WidgetMeta }).default),
		])
		return { name, path, entryFileName, meta }
	})
}

async function buildWidget(
	{ name, path, entryFileName, meta }: WidgetSourceInfo,
	{ onScriptEntryFound }: { onScriptEntryFound: (entry: ScriptBuildEntry) => void },
) {
	const mwPageTitle = `Widget:${name}`
	const entryPath = `${path}/${entryFileName}`

	switch (meta.type) {
		case 'script': {
			assert(isValidScriptWidgetName(name), `script模式不支持的widget名：${name}`)
			if (meta.scriptType === 'module') {
				onScriptEntryFound({
					type: 'asset',
					name: name,
					path: entryPath,
					onBuildSuccess: async (scriptSourceUrl) => {
						const widgetContent =
							formatScriptWidgetBanner({
								widgetName: name,
								scriptSourceUrl,
								meta,
							}) + SCRIPT_WIDGET_FOOTER
						await writeBuiltPage(mwPageTitle, widgetContent)
					},
				})
				return
			}
			if (meta.scriptType === 'module-inline') {
				onScriptEntryFound({
					type: 'mw-page',
					title: mwPageTitle,
					meta: {
						path: entryPath,
						format: 'es',
						postBanner: () =>
							formatScriptWidgetBanner({
								widgetName: name,
								meta,
							}),
						postFooter: SCRIPT_WIDGET_FOOTER,
						sourceMap: false,
					},
				})
				return
			}
			if (meta.scriptType === 'classic-inline-no-chunk') {
				const code = await compileJS(entryPath, { format: 'iife', strict: true })
				const widgetContent =
					formatScriptWidgetBanner({ widgetName: name, meta }) + code + SCRIPT_WIDGET_FOOTER
				await writeBuiltPage(mwPageTitle, widgetContent)
				return
			}

			throw new Error('未知scriptType')
		}
		case 'component': {
			const Component = (
				(await import(`@/${path}/${entryFileName}`)) as { default: () => ReactNode }
			).default
			const html = await compileComponent(Component())
			const widgetContent = toWidgetWikiContent({
				widgetName: name,
				content: html,
				meta,
			})
			await writeBuiltPage(mwPageTitle, widgetContent)
			return
		}
	}
}

/**
 * widget名称用于定义“只嵌入一次”的变量。
 * 我也不知道具体命名限制，懒得试，写保守点免得遇到问题
 */
function isValidScriptWidgetName(name: string): boolean {
	return /^[a-zA-Z]\w*$/.test(name)
}
