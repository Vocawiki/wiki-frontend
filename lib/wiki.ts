import { assert } from 'radashi'

import { BASE_URL } from './config'
import { graphemesOf } from './string'

export function normalizeWikiTitle(title: string): string {
	const s = title.replace(/[_\s]+/gu, ' ').trim()
	assert(s.length > 0, `标题为空：“${title}”`)
	const [firstChar] = graphemesOf(s)
	const firstCharUpperCase = firstChar!.toUpperCase()
	return firstCharUpperCase + s.slice(firstChar!.length)
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
