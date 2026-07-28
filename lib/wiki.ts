import { assert } from 'radashi'

import { BASE_URL } from './config'

export function normalizeWikiTitle(title: string): string {
	const s = title.replace(/[_\s]+/g, ' ').trim()
	assert(s.length > 0, `标题为空：“${title}”`)
	const unicodeCharacters = [...s]
	unicodeCharacters[0] = unicodeCharacters[0]!.toUpperCase()
	return unicodeCharacters.join('')
}

export function normalizeWikiTitleForURL(title: string): string {
	return normalizeWikiTitle(title).replaceAll(' ', '_')
}

export function withBaseURL(urlPart: string, options: { absolute?: boolean } = {}): string {
	assert(urlPart.startsWith('/'), 'URL必须以“/”开头')
	if (options.absolute) {
		return 'https://voca.wiki' + urlPart
	}
	return BASE_URL + urlPart
}
