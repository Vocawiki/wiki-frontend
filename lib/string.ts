import type { Tagged } from 'type-fest'

export type Base64String = Tagged<string, 'Base64String'>

export function toBase64(str: string): Base64String {
	const bytes = new TextEncoder().encode(str)
	return bytes.toBase64() as Base64String
}

export const graphemesOf: (str: string) => Iterable<string> = (() => {
	if (!('Segmenter' in Intl)) {
		// fallback
		return (str) => str
	}

	const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
	return function* (str) {
		for (const seg of segmenter.segment(str)) {
			yield seg.segment
		}
	}
})()
