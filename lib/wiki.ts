import { assert } from 'radashi'
import type { ValueOf } from 'type-fest'

import { BASE_URL } from './config'
import { graphemesOf } from './string'
import type { ObjectEntries } from './typing'

const namespaceNameToNumber = {
	Media: -2,
	Special: -1,
	'': 0,
	Talk: 1,
	User: 2,
	'User talk': 3,
	// Project: 4,
	// 'Project talk': 5,
	Vocawiki: 4,
	'Vocawiki talk': 5,
	File: 6,
	'File talk': 7,
	MediaWiki: 8,
	'MediaWiki talk': 9,
	Template: 10,
	'Template talk': 11,
	Help: 12,
	'Help talk': 13,
	Category: 14,
	'Category talk': 15,
	Widget: 274,
	'Widget talk': 275,
	TimedText: 710,
	'TimedText talk': 711,
	Module: 828,
	'Module talk': 829,
	HTML: 8310,
	'HTML talk': 8311,
} as const satisfies Record<string, number>
const noAutoCapitalizeNsNumbers = new Set<NamespaceNumber>([0, 1, 14, 15])
export type NamespaceName = keyof typeof namespaceNameToNumber
export type NamespaceNumber = ValueOf<typeof namespaceNameToNumber>

const entries = Object.entries(namespaceNameToNumber) as ObjectEntries<typeof namespaceNameToNumber>
const namespaceNumberToName = new Map<number, NamespaceName>(
	entries.map(([name, number]) => [number, name]),
)
const lowercaseNamespaceNameToNumber = new Map<string, NamespaceNumber>(
	entries.map(([name, number]) => [name.toLowerCase(), number]),
)

export function isValidWikiTitle(title: string): boolean {
	if (/[<>\[\]|{}]/u.test(title)) {
		return false
	}
	return true
}

export interface WikiTitleInfo {
	namespace: { name: NamespaceName; number: number }
	normalizedPageNameNoNamespace: string
	unnormalizedPageNameNoNamespace: string
}
export function getWikiTitleInfo(title: string): WikiTitleInfo {
	if (!isValidWikiTitle(title)) {
		throw new Error(`“${title}”不是一个有效的MediaWiki标题`)
	}

	const [nsNumber, unnormalizedPageName] = ((): [NamespaceNumber, string] => {
		const m = title.match(/^(.*?):(.*)$/u)
		if (!m) {
			return [0, title]
		}
		const [, maybeNs, maybePageName] = m as [string, string, string]
		const nsNumber = lowercaseNamespaceNameToNumber.get(normalizeSpace(maybeNs).toLowerCase())
		if (nsNumber === undefined) {
			return [0, title]
		}
		return [nsNumber, maybePageName]
	})()

	const spaceNormalized = normalizeSpace(unnormalizedPageName)
	if (spaceNormalized === '') {
		throw new Error(`标题为空：“${title}”`)
	}
	return {
		namespace: { name: namespaceNumberToName.get(nsNumber)!, number: nsNumber },
		normalizedPageNameNoNamespace: capitalizeTitleByNs(spaceNormalized, nsNumber),
		unnormalizedPageNameNoNamespace: unnormalizedPageName,
	}
}

export function normalizeWikiTitle(title: string): string {
	const info = getWikiTitleInfo(title)
	if (info.namespace.number === 0) {
		return info.normalizedPageNameNoNamespace
	}
	return `${info.namespace.name}:${info.normalizedPageNameNoNamespace}`
}

export function normalizeWikiTitleForURL(title: string): string {
	return normalizeWikiTitle(title).replaceAll(' ', '_')
}

export function withBaseURL(urlPart: string, options: { absolute?: boolean } = {}): string {
	assert(urlPart.startsWith('/'), 'URL必须以“/”开头')
	if (options.absolute) {
		return `https://voca.wiki${urlPart}`
	}
	return BASE_URL + urlPart
}

function normalizeSpace(titlePart: string): string {
	return titlePart.replace(/[_\s]+/gu, ' ').trim()
}

function capitalizeTitleByNs(title: string, namespaceNumber: NamespaceNumber): string {
	if (noAutoCapitalizeNsNumbers.has(namespaceNumber)) {
		return title
	}
	const [firstChar] = graphemesOf(title)
	const firstCharUpperCase = firstChar!.toUpperCase()
	return `${firstCharUpperCase}${title.slice(firstChar!.length)}`
}
