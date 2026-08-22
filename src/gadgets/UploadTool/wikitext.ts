import type { MessageKey } from './i18n'
import type { Chip } from './types'

type MsgFn = (key: MessageKey, ...params: string[]) => string

export interface WikitextInput {
	sourcePage: string
	authorChips: Chip[]
	characterChips: Chip[]
	functionChips: Chip[]
	licenseTpl: string
	licenseParams: string
	trademark: boolean
	disambigTitles: string[]
}

/** 去掉作者名末尾的消歧义后缀。 */
export function formatAuthorSummaryName(
	name: string | undefined,
	disambigTitles: string[],
): string {
	name = String(name ?? '')
	const base = name.replace(/[（(][^（）()]*[)）]$/, '')
	return base !== name && disambigTitles.includes('Category:作者:' + base) ? base : name
}

/** 生成文件描述wikitext。*/
export function buildWikitext(input: WikitextInput, msg: MsgFn): string {
	const lines = [msg('wikitext-summary')]
	const src = (input.sourcePage || '').trim()
	if (src) {
		lines.push(msg('wikitext-source') + src)
	}
	const authors = input.authorChips
		.map((a) => String(a?.value ?? a))
		.map((name) => formatAuthorSummaryName(name, input.disambigTitles))
		.filter(Boolean)
	if (authors.length) {
		lines.push(msg('wikitext-author') + authors.join('、'))
	}
	input.characterChips.forEach((c) => {
		if (c.value) {
			lines.push(msg('wikitext-category', c.value))
		}
	})
	input.authorChips.forEach((a) => {
		if (a.value) {
			lines.push(msg('wikitext-author-category', a.value))
		}
	})
	input.functionChips.forEach((c) => {
		const name = String(c?.value ?? c).replace(/^[\s\u3000]+|[\s\u3000]+$/g, '')
		if (name) {
			lines.push(msg('wikitext-category', name))
		}
	})
	lines.push('')
	lines.push(msg('wikitext-license'))
	if (input.licenseTpl) {
		lines.push('{{' + input.licenseTpl + input.licenseParams + '}}')
	}
	if (input.trademark) {
		lines.push('{{Trademark}}')
	}
	return lines.join('\n')
}
