import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { writeBuiltPage } from '@/scripts/utils/page'
import gadgetListMeta from '@/src/gadgets/(meta)'
import { toGadgetDefinition, type GadgetMeta } from '@/tools/gadget'
import { getFileInfo } from '@/tools/gadget/file'

import { noticeForEditors } from '../utils/notice'
import { gadgetBuilders } from './builders'
import type { GadgetsDefinition, GadgetsDefinitionNode } from './definition'

const GADGET_LIST_META_PATH = 'src/gadgets/(meta).ts'

export async function buildGadgets() {
	const definition = await collectGadgetsDefinition()
	const gadgets = definition.filter((x) => x.type === 'gadget')
	const tasks = [
		buildGadgetsDefinition(definition),
		...gadgets.map((x) => buildGadget(x.name, x.meta)),
	]
	await Promise.all(tasks)
}

async function buildGadget(name: string, meta: GadgetMeta): Promise<void> {
	const pages = meta.pages
	const tasks = pages.map(async (page) => {
		if (page.type === 'existing') return

		const fileInfo = getFileInfo(page.entry)
		const builder = gadgetBuilders[fileInfo.extension]
		assert(builder, `不支持的文件类型: ${fileInfo.extension}，gadget: ${name}`)
		const { content } = await builder({ path: join('src/gadgets', name, page.entry) })
		await writeBuiltPage(
			`MediaWiki:Gadget-${fileInfo.baseName}.${fileInfo.builtExtension}`,
			content,
		)
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
		return toGadgetDefinition(node.name, node.meta)
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
				name: node,
				meta: gadgetsInDir.find((x) => x.name === node)!.meta,
			}
		}
		return node
	})
}

/**
 * 收集所有 `src/gadgets/<name>/(meta).ts` 定义的 gadget，不包括草稿
 */
async function collectGadgetsInDir(): Promise<{ name: string; meta: GadgetMeta }[]> {
	const entries = (await readdir('src/gadgets', { withFileTypes: true })).filter((x) =>
		x.isDirectory(),
	)
	const tasks = entries.map(async ({ name }): Promise<{ name: string; meta: GadgetMeta }> => {
		assert(isValidGadgetName(name), '无效的gadget名：' + name)
		return {
			name,
			meta: ((await import(`@/src/gadgets/${name}/(meta)`)) as { default: GadgetMeta }).default,
		}
	})
	const gadgetDefinitions = (await Promise.all(tasks)).filter((x) => !x.meta.$draft)
	return gadgetDefinitions
}

function isValidGadgetName(name: string): boolean {
	return /^[a-zA-Z](?:[\w\-.]*[a-zA-Z\d])?$/.test(name)
}
