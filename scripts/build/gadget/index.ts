import assert from 'node:assert/strict'
import { extname } from 'node:path'

import { globby, convertPathToPattern } from 'globby'
import type PQueue from 'p-queue'
import type { NonEmptyTuple } from 'type-fest'

import { writeBuiltPage } from '@/scripts/utils/page'
import gadgetListMeta from '@/src/gadgets/(meta)'
import {
	srcDistExtensionMap,
	type GadgetMeta,
	type GadgetMetaPage,
	type GadgetSourceFileExtension,
} from '@/tools/gadget'

import type { ScriptBuildEntry } from '../types'
import { findCodeEntries } from '../utils/code-entry'
import { noticeForEditors } from '../utils/notice'
import { buildCss } from './builders'
import {
	toGadgetDefinition,
	type GadgetsDefinition,
	type GadgetsDefinitionNode,
} from './definition'
import { getGadgetSourceFileInfo } from './file-info'
import type { ParsedGadgetMeta } from './types'

const GADGET_LIST_META_PATH = 'src/gadgets/(meta).ts'

export async function buildGadgets({
	queue,
	onScriptEntryFound,
}: {
	queue: PQueue
	onScriptEntryFound: (entry: ScriptBuildEntry) => void
}) {
	const definition = await collectGadgetsDefinition()
	void queue.add(() => buildGadgetsDefinition(definition))
	const gadgets = definition.filter((x) => x.type === 'gadget')

	gadgets.forEach(({ meta }) => buildGadget(meta, queue, onScriptEntryFound))
}

function buildGadget(
	meta: ParsedGadgetMeta,
	queue: PQueue,
	onScriptEntryFound: (entry: ScriptBuildEntry) => void,
) {
	meta.pages.forEach((page) => {
		if (page.type === 'existing') return

		if (page.type === 'custom') {
			void queue.add(async () => {
				const pages = Object.entries(await page.getContents({ noticeForEditors }))
				pages.forEach(([name, content]) => {
					void queue.add(() => writeBuiltPage(`MediaWiki:Gadget-${name}`, content))
				})
			})
			return
		}

		const fileInfo = getGadgetSourceFileInfo(page.entry)
		const outputName = page.outputName ?? `${fileInfo.baseName}.${fileInfo.builtExtension}`
		const title = `MediaWiki:Gadget-${outputName}`
		const path = `${meta.dir}/${page.entry}`

		if (fileInfo.extension === 'css') {
			void queue.add(async () => {
				const { content } = await buildCss({ path })
				await writeBuiltPage(title, content)
			})
			return
		}

		onScriptEntryFound({
			type: 'mw-page',
			title,
			meta: {
				format: 'iife',
				path,
				sourceMap: false,
				postBanner: `/**
 * ${noticeForEditors(path).join('\n * ')}
 */
/* <nowiki> */
`,
				postFooter: `
/* </nowiki> */`,
			},
		})
	})
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
 * 收集所有 `src/gadgets/(group)/.../(group)/<name>/(meta).ts` 定义的 gadget，不包括草稿
 */
async function collectGadgetsInDir(): Promise<ParsedGadgetMeta[]> {
	const entries = await findCodeEntries('src/gadgets')
	const tasks = entries.map(
		async ({ name: gadgetName, path: gadgetDir }): Promise<ParsedGadgetMeta | null> => {
			assert(isValidGadgetName(gadgetName), `无效的gadget名：${gadgetName}，位于${gadgetDir}`)
			const rawMeta = ((await import(`@/${gadgetDir}/(meta)`)) as { default: GadgetMeta }).default
			if (rawMeta.$draft) {
				return null
			}

			const pages =
				rawMeta.pages ??
				(await (async () => {
					const pages = (
						await globby(`${convertPathToPattern(gadgetDir)}/index.*`, { stats: true })
					).map((entry): GadgetMetaPage => {
						const extension = extname(entry.name).slice(1)
						const builtExtension = srcDistExtensionMap[
							extension as keyof typeof srcDistExtensionMap
						] as string | undefined
						if (!builtExtension) {
							throw new Error(`${gadgetDir}/${entry.name}的扩展名不受支持`)
						}
						return {
							type: 'source',
							entry: entry.name as `${string}.${GadgetSourceFileExtension}`,
							outputName: `${gadgetName}.${builtExtension}`,
						}
					})
					if (pages.length === 0) {
						throw new Error(`${gadgetDir}既没有index文件，也没有在meta中指定pages`)
					}
					return pages as unknown as NonEmptyTuple<GadgetMetaPage>
				})())

			return {
				...rawMeta,
				name: gadgetName,
				dir: gadgetDir,
				pages,
			}
		},
	)
	const gadgetDefinitions = (await Promise.all(tasks)).filter((x) => x !== null)
	return gadgetDefinitions
}

function isValidGadgetName(name: string): boolean {
	return /^[a-zA-Z](?:[\w\-.]*[a-zA-Z\d])?$/.test(name)
}
