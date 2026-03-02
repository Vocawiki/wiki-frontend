import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'

import type { ReactNode } from 'react'

import { getFileInfo } from '@/scripts/utils/file-info'
import { writeBuiltPage } from '@/scripts/utils/page'
import type { WidgetMeta } from '@/tools/widget'

import { compileComponent } from '../compilers'
import { compileJS } from '../compilers/js-compiler'
import { toWidgetWikiContent, toScriptWidgetWikiContent } from './widget-template'

export async function buildWidgets() {
	const widgetEntries = await findWidgets('src/widgets')
	await Promise.all(widgetEntries.map((entity) => buildWidget(entity)))
}

interface WidgetSourceInfo {
	widgetName: string
	entryFile: string
}

/**
 * 查找 dir 下的 index.xx 文件
 * @returns 文件名
 */
async function findIndexFile(underDir: string): Promise<string | null> {
	for (const x of await readdir(underDir, { withFileTypes: true })) {
		if (x.isFile() && getFileInfo(x.name).baseName === 'index') {
			return x.name
		}
	}
	return null
}

async function findWidgets(dir: string): Promise<WidgetSourceInfo[]> {
	const tasks = (await readdir(dir, { withFileTypes: true })).map(async (x) => {
		if (x.isDirectory()) {
			const dir = `${x.parentPath}/${x.name}`
			const indexFileName = await findIndexFile(dir)
			if (indexFileName === null) return null
			return {
				widgetName: x.name,
				entryFile: indexFileName,
			}
		}
		return null
	})
	return (await Promise.all(tasks)).filter((x) => x !== null)
}

async function buildWidget({ widgetName, entryFile }: WidgetSourceInfo) {
	const meta = ((await import(`~/widgets/${widgetName}/(meta)`)) as { default: WidgetMeta }).default

	let widgetContent: string

	switch (meta.type) {
		case 'script': {
			assert(isValidScriptWidgetName(widgetName), 'script模式不支持的widget名：' + widgetName)
			const code = await compileJS(`src/widgets/${widgetName}/${entryFile}`, meta.buildOptions)
			widgetContent = toScriptWidgetWikiContent({
				widgetName,
				script: code,
				meta,
			})
			break
		}
		case 'component': {
			const Component = (
				(await import(`~/widgets/${widgetName}/${entryFile}`)) as { default: () => ReactNode }
			).default
			const html = await compileComponent(Component())
			widgetContent = toWidgetWikiContent({
				widgetName,
				content: html,
				meta,
			})
			break
		}
	}

	await writeBuiltPage(`Widget:${widgetName}`, widgetContent)
}

/**
 * widget名称用于定义“只嵌入一次”的变量。
 * 我也不知道具体命名限制，懒得试，写保守点免得遇到问题
 */
function isValidScriptWidgetName(name: string): boolean {
	return /^[a-zA-Z]\w*$/.test(name)
}
