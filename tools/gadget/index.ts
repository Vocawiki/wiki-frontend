import assert from 'node:assert/strict'

import type { Simplify } from 'type-fest'

import { getFileInfo } from './file'
import type { GadgetMeta } from './types'

export type { GadgetMeta } from './types'

type FilerByValueType<T, V> = {
	[K in keyof T as T[K] extends V ? K : never]: T[K]
}
type GadgetMetaOnlyRootFlags = Omit<FilerByValueType<GadgetMeta, boolean | undefined>, 'supportsUrlLoad'>
type GadgetMetaOnlyRootLists = FilerByValueType<GadgetMeta, (string | number)[] | undefined>
type GadgetMetaOnlyRootSingleValues = Simplify<
	FilerByValueType<GadgetMeta, string | undefined> & Pick<GadgetMeta, 'supportsUrlLoad'>
>

export function toGadgetDefinition(gadgetName: string, meta: GadgetMeta): string {
	assert.match(gadgetName, /^[A-Za-z][A-Za-z0-9\-_.]*$/, `gadget名不合法：${gadgetName}`)

	const options: string[] = []

	function flag(name: keyof GadgetMetaOnlyRootFlags): void
	function flag(name: string, enabled: boolean | undefined): void
	function flag(name: string, enabled?: boolean): void {
		if (arguments.length === 1) {
			enabled = meta[name as keyof GadgetMetaOnlyRootFlags]
		}
		if (enabled) {
			options.push(name)
		}
	}

	function list(name: keyof GadgetMetaOnlyRootLists): void
	function list(name: string, values: readonly (string | number)[] | undefined): void
	function list(name: string, values?: readonly (string | number)[]): void {
		if (arguments.length === 1) {
			values = meta[name as keyof GadgetMetaOnlyRootLists]
		}
		if (values === undefined) return

		if (values.length === 0) return
		const list = values.map((v) => {
			const str = String(v)
			assert.doesNotMatch(str, /^\s*$/, `${gadgetName}的meta中，${name}字段出现了空白字符串`)
			return str
		})

		options.push(`${name}=${list.join(', ')}`)
	}

	function value(name: keyof GadgetMetaOnlyRootSingleValues): void
	function value(name: string, value: string | boolean): void
	function value(name: string, value?: string | boolean): void {
		if (arguments.length === 1) {
			value = meta[name as keyof GadgetMetaOnlyRootSingleValues]
		}
		if (value === undefined) return

		const str = String(value)
		assert.doesNotMatch(str, /^\s*$/, `${gadgetName}的meta中，${name}字段出现了空白字符串`)
		options.push(`${name}=${value}`)
	}

	const af = meta.availableFor ?? {}

	// 与 https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Gadgets 顺序保持一致以避免遗漏
	flag('ResourceLoader', meta.withResourceLoader)
	list('dependencies')
	list('rights', af.rights)
	flag('hidden')
	list('skins', af.skins)
	list('actions', af.actions)
	list('categories', af.categories)
	list('namespaces', af.namespaces)
	list('contentModels', af.contentModels)
	flag('default', meta.defaultEnabled)
	flag('package', meta.packaged)
	value('type')
	list('peers')
	list('codexIcons')
	value('supportsUrlLoad')
	// 被移除的选项就不加了，除非我们还想支持旧版 MediaWiki

	const pages = meta.pages.map((page) => {
		switch (page.type) {
			case 'source': {
				const { baseName, builtExtension } = getFileInfo(page.entry)
				return `${baseName}.${builtExtension}`
			}
			case 'existing': {
				return page.name
			}
		}
	})

	return `* ${gadgetName} [${options.join('|')}] | ${pages.join(' | ')}`
}
