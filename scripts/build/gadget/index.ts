import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import type { NonEmptyTuple } from 'type-fest'

import { getFileInfo } from '@/scripts/utils/file-info'
import { writeBuiltPage } from '@/scripts/utils/page'
import gadgetListMeta from '@/src/gadgets/(meta)'
import {
	srcDistExtensionMap,
	type GadgetMeta,
	type GadgetMetaPage,
	type GadgetSourceFileExtension,
} from '@/tools/gadget'

import { noticeForEditors } from '../utils/notice'
import { gadgetBuilders } from './builders'
import {
	toGadgetDefinition,
	type GadgetsDefinition,
	type GadgetsDefinitionNode,
} from './definition'
import { getGadgetSourceFileInfo } from './file-info'
import type { ParsedGadgetMeta } from './types'

const GADGET_LIST_META_PATH = 'src/gadgets/(meta).ts'

export async function buildGadgets() {
	const definition = await collectGadgetsDefinition()
	const gadgets = definition.filter((x) => x.type === 'gadget')
	const tasks = [buildGadgetsDefinition(definition), ...gadgets.map((x) => buildGadget(x.meta))]
	await Promise.all(tasks)
}

async function buildGadget(meta: ParsedGadgetMeta): Promise<void> {
	const pages = meta.pages
	const tasks = pages.map(async (page) => {
		if (page.type === 'existing') return

		if (page.type === 'custom') {
			const pages = Object.entries(await page.getContents({ noticeForEditors }))
			const tasks = pages.map(async ([name, content]) => {
				await writeBuiltPage(`MediaWiki:Gadget-${name}`, content)
			})
			await Promise.all(tasks)
			return
		}

		const fileInfo = getGadgetSourceFileInfo(page.entry)
		const builder = gadgetBuilders[fileInfo.extension]
		assert(builder, `不支持的文件类型: ${fileInfo.extension}，gadget: ${meta.name}`)
		const { content } = await builder({ path: join('src/gadgets', meta.name, page.entry) })
		const outputName = page.outputName ?? `${fileInfo.baseName}.${fileInfo.builtExtension}`
		await writeBuiltPage(`MediaWiki:Gadget-${outputName}`, content)
	})
	await Promise.all(tasks)
}

async function buildGadgetsDefinition(definitionNodes: GadgetsDefinition) {
	const noticeNode: GadgetsDefinitionNode = {
		type: 'h2',
		text: noticeForEditors(GADGET_LIST_META_PATH).join(''),
	}
	const lines = [noticeNode, ...definitionNodes].map((node, index) => {
		if (node.type === 'h2') {
			return `${index === 0 ? '' : '\n'}== ${node.text} ==`
		}
		return toGadgetDefinition(node.meta)
	})
	await writeBuiltPage('MediaWiki:Gadgets-definition', lines.join('\n'))
}

async function collectGadgetsDefinition(): Promise<GadgetsDefinition> {
	const gadgetsInDir = await collectGadgetsInDir()

	// 检查是否有 src/gadgets/(meta).ts 中遗漏的组件
	const nameSetInDir = new Set(gadgetsInDir.map((x) => x.name))
	const nameSetInRootMeta = new Set(gadgetListMeta.filter((x) => typeof x === 'string'))
	const namesInDirButNotInRootMeta = nameSetInDir.difference(nameSetInRootMeta)
	const namesInRootMetaButNotInDir = nameSetInRootMeta.difference(nameSetInDir)
	if (namesInDirButNotInRootMeta.size > 0) {
		throw new Error(
			`这些 gadget 没有在\`${GADGET_LIST_META_PATH}\`列出，也未被标记为\`$draft: true\`：${[...namesInDirButNotInRootMeta].join('、')}`,
		)
	}
	if (namesInRootMetaButNotInDir.size > 0) {
		throw new Error(
			`\`${GADGET_LIST_META_PATH}\`所指定的这些 gadget，在文件夹中不存在或被标记为\`$draft: true\`：${[...namesInRootMetaButNotInDir].join('、')}`,
		)
	}

	return gadgetListMeta.map((node): GadgetsDefinitionNode => {
		if (typeof node === 'string') {
			return {
				type: 'gadget',
				meta: gadgetsInDir.find((x) => x.name === node)!,
			}
		}
		return node
	})
}

/**
 * 收集所有 `src/gadgets/<name>/(meta).ts` 定义的 gadget，不包括草稿
 */
async function collectGadgetsInDir(): Promise<ParsedGadgetMeta[]> {
	const entries = (await readdir('src/gadgets', { withFileTypes: true })).filter((x) =>
		x.isDirectory(),
	)
	const tasks = entries.map(async ({ name: gadgetName }): Promise<ParsedGadgetMeta | null> => {
		assert(isValidGadgetName(gadgetName), '无效的gadget名：' + gadgetName)
		const rawMeta = (
			(await import(`@/src/gadgets/${gadgetName}/(meta)`)) as { default: GadgetMeta }
		).default
		if (rawMeta.$draft) {
			return null
		}

		const pages =
			rawMeta.pages ??
			(await (async () => {
				const pages = (await readdir(join('src/gadgets', gadgetName), { withFileTypes: true }))
					.map<GadgetMetaPage | null>((entry) => {
						if (!entry.isFile()) return null
						const { baseName, extension } = getFileInfo(entry.name)
						if (baseName !== 'index') return null
						const builtExtension = srcDistExtensionMap[
							extension as keyof typeof srcDistExtensionMap
						] as string | undefined
						if (!builtExtension) {
							throw new Error(`gadgets/${gadgetName}/${entry.name}的扩展名不受支持`)
						}
						return {
							type: 'source',
							entry: entry.name as `${string}.${GadgetSourceFileExtension}`,
							outputName: `${gadgetName}.${builtExtension}`,
						}
					})
					.filter((x) => x !== null)
				if (pages.length === 0) {
					throw new Error(`gadgets/${gadgetName}没有index文件，也没有在meta中指定pages`)
				}
				return pages as unknown as NonEmptyTuple<GadgetMetaPage>
			})())
		return {
			...rawMeta,
			name: gadgetName,
			pages,
		}
	})
	const gadgetDefinitions = (await Promise.all(tasks)).filter((x) => x !== null)
	return gadgetDefinitions
}

function isValidGadgetName(name: string): boolean {
	return /^[a-zA-Z](?:[\w\-.]*[a-zA-Z\d])?$/.test(name)
}
