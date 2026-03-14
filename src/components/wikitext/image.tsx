import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'
import { TokenList } from '@/lib/utils'
import { normalizeWikiTitle, withBaseURL } from '@/lib/wiki'

import { WikiImage } from '../wiki-image'

export interface WikitextImageProps {
	file: string
	width?: number
	height?: number
	link?: string | false
	alt?: string
	className?: string
}

export function WikitextImage(props: WikitextImageProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return <WikitextImageHTML {...props} />

	const { file, width, height, link, alt, className } = props

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

function WikitextImageHTML({ file, width, height, link, alt, className }: WikitextImageProps) {
	const normalizedTitle = 'File:' + normalizeWikiTitle(file)
	// 对于真正的wikitext，width和height并不是下面这个逻辑
	const img = (
		<WikiImage
			alt={alt}
			file={file}
			decoding="async"
			width={width}
			height={height}
			className="mw-file-element"
			// data-file-width=""
			// data-file-height=""
		/>
	)
	const wrapper = link ? (
		<a
			href={withBaseURL('/' + normalizedTitle)}
			onClick={(e) => {
				e.preventDefault()
				location.hash = '#/media/' + normalizedTitle
			}}
			className="mw-file-description"
		>
			{img}
		</a>
	) : (
		<span>{img}</span>
	)

	const sizeIsUnset = width === undefined && height === undefined
	const classList = new TokenList(sizeIsUnset ? 'mw-default-size' : undefined, className)

	return (
		<span className={classList.length > 0 ? classList.toString() : undefined} typeof="mw:File">
			{wrapper}
		</span>
	)
}
