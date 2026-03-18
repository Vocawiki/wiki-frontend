import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

import { WikitextImageDevPreview } from './image-dev-preview'

export interface WikitextImageProps {
	file: string
	width?: number
	height?: number
	link?: string | false
	alt?: string
	className?: string
	suppressSbWikitextError?: boolean
}

export function WikitextImage(props: WikitextImageProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return <WikitextImageDevPreview {...props} />

	const { file, width, height, link, alt, className, suppressSbWikitextError } = props

	if (className?.includes(']') && !suppressSbWikitextError) {
		// 出错的例子：
		// [https://example.com [[File:xxx|class=[&_img]:xxx]]]
		throw new Error(
			'SB wikitext会解析错误，不建议在class里包含“]”。如果确需包含，请设置suppressSbWikitextError',
		)
	}

	let size: string | undefined = ''
	if (width) {
		size += width.toString()
	}
	if (height) {
		size += `x${height}`
	}
	if (size) {
		size += 'px'
	} else {
		size = undefined
	}

	const args = [
		size,
		link === undefined ? undefined : `link=${link || ''}`,
		alt === undefined ? undefined : `alt=${alt}`,
		className === undefined ? undefined : `class=${className}`,
	]
		.filter((x) => x !== undefined)
		.join('|')

	return `[[File:${file}${args ? `|${args}` : ''}]]`
}
