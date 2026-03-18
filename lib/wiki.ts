import { assert } from 'radashi'

import { BASE_URL } from './config'

export function normalizeWikiTitle(title: string): string {
	const s = title.replaceAll(' ', '_').replace(/^_*(.+?)_*$/, '$1')
	assert(s.length > 0, `标题为空：“${title}”`)
	const unicodeCharacters = [...s]
	unicodeCharacters[0] = unicodeCharacters[0]!.toUpperCase()
	return unicodeCharacters.join('')
}

export function withBaseURL(urlPart: string, options: { absolute?: boolean } = {}): string {
	assert(urlPart.startsWith('/'), 'URL必须以“/”开头')
	if (options.absolute) {
		// FIXME
		return 'https://voca.wiki' + urlPart
	}
	return BASE_URL + urlPart
}
