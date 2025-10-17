/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* AnyScript，启动！ */

import assert from 'node:assert/strict'

import type { NonEmptyTuple } from 'type-fest'

import type { GadgetMeta } from '@/tools/gadget'

/**
 * 解析单个gadget的定义
 * @example
 * ```ts
 * const definition = '* Logout-confirm[ResourceLoader|default|type=general]|Logout-confirm.js'
 * const meta = gadgetMetaFromGadgetDefinition(definition)
 */
export function parseGadgetDefinition(definition: string): { name: string; meta: GadgetMeta } {
	const match = definition.match(
		/^\*\s*(?<name>[A-Za-z][A-Za-z0-9\-_.]*)\s*\[(?<options>.+?)\]\s*\|\s*(?<pages>.+?)\s*$/,
	)
	assert(match, `无法解析小工具定义：${definition}`)
	const groups = match.groups!
	const gadgetName = groups.name!
	const gadgetOptions = Object.fromEntries(
		groups.options!.split(/\s*\|\s*/g).map((s) => {
			const kvMatch = s.match(/^(.+?)\s*=\s*(.+?)$/)
			if (kvMatch) {
				return [kvMatch[1], { type: 'kv', value: kvMatch[2]! }]
			} else {
				return [s, { type: 'flag' }]
			}
		}),
	) as Record<string, { type: 'flag' } | { type: 'kv'; value: string }>

	function parseList(optionName: string): string[] | undefined {
		const value = gadgetOptions[optionName]
		if (!value) return undefined
		assert(value.type === 'kv')
		return value.value.split(/\s*,\s*/g)
	}

	function parseFlag(optionName: string): true | undefined {
		const value = gadgetOptions[optionName]
		if (!value) return undefined
		assert(value.type === 'flag')
		return true
	}

	function parseValue(optionName: string): string | undefined {
		const value = gadgetOptions[optionName]
		if (!value) return undefined
		assert(value.type === 'kv')
		return value.value
	}

	const gadgetPages = groups.pages!.split(/\s*\|\s*/g)
	const meta = {
		pages: gadgetPages.map((page) => ({
			type: 'existing',
			name: page,
		})) as any,
		withResourceLoader: parseFlag('ResourceLoader') ?? false,
		defaultEnabled: parseFlag('default') ?? false,
		hidden: parseFlag('hidden'),
		type: parseValue('type') as any,
		packaged: parseFlag('package'),
		dependencies: parseList('dependencies'),
		peers: parseList('peers'),
		availableFor: {
			rights: parseList('rights') as any,
			skins: parseList('skins') as any,
			actions: parseList('actions') as any,
			categories: parseList('categories') as any,
			namespaces: (() => {
				const strings = parseList('namespaces')
				if (strings === undefined) return undefined
				return strings.map((s) => Number.parseInt(s)) as unknown as NonEmptyTuple<number>
			})(),
			contentModels: parseList('contentModels') as any,
			targets: parseList('targets') as any,
		},
		codexIcons: parseList('codexIcons'),
		supportsUrlLoad: (() => {
			const s = parseValue('supportsUrlLoad')
			if (s === undefined) return undefined
			if (s === 'true') return true
			if (s === 'false') return false
			throw new Error('选项 `supportsUrlLoad` 的值未知')
		})(),
		topLoaded: parseFlag('topLoaded'),
		requiresES6: parseFlag('requiresES6'),
	} satisfies GadgetMeta
	deleteUndefinedOrEmptyObject(meta)
	return { name: gadgetName, meta }
}

function deleteUndefinedOrEmptyObject(o: object) {
	for (const [k, v] of Object.entries(o)) {
		if (Array.isArray(v)) {
			continue
		}
		const type = typeof v
		if (type === 'object') {
			deleteUndefinedOrEmptyObject(v as object)
			if (Object.entries(v as object).length === 0) {
				delete (o as Record<string, any>)[k]
			}
		} else if (type === 'undefined') {
			delete (o as Record<string, any>)[k]
		}
	}
}

export type GadgetsDefinitionNode = { type: 'h2'; text: string } | { type: 'gadget'; name: string; meta: GadgetMeta }
export type GadgetsDefinition = GadgetsDefinitionNode[]

/**
 * 解析[[MediaWiki:Gadgets-definition]]
 * @param content [[MediaWiki:Gadgets-definition]]中的内容
 * @returns 结构化数据
 */
export function parseGadgetsDefinition(content: string): GadgetsDefinition {
	return content
		.split('\n')
		.map((line): GadgetsDefinitionNode | null => {
			if (line.trim() === '') return null // 空白行

			if (line.startsWith('*')) {
				// 定义行
				return { type: 'gadget', ...parseGadgetDefinition(line) }
			}

			const match = line.match(/^==\s*(.+?)\s*==\s*$/)
			if (match) {
				// 标题行
				return { type: 'h2', text: match[1]! }
			}

			throw new Error('无法识别的行：' + line)
		})
		.filter((x) => x !== null)
}
