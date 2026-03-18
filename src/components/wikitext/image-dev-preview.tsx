'use client'

import { TokenList } from '@/lib/utils'
import { normalizeWikiTitle, withBaseURL } from '@/lib/wiki'

import { WikiImage } from '../wiki-image'
import type { WikitextImageProps } from './image'

export function WikitextImageDevPreview({
	file,
	width,
	height,
	link,
	alt,
	className,
}: WikitextImageProps) {
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
	let wrapper
	if (link === undefined) {
		const normalizedTitle = 'File:' + normalizeWikiTitle(file)
		wrapper = (
			<a
				href={withBaseURL(`/${normalizedTitle}`)}
				onClick={(e) => {
					e.preventDefault()
					location.hash = '#/media/' + normalizedTitle
				}}
				className="mw-file-description"
			>
				{img}
			</a>
		)
	} else if (link) {
		wrapper = (
			<a href={`/${link}`} className="mw-file-description">
				{img}
			</a>
		)
	} else {
		wrapper = <span>{img}</span>
	}

	const sizeIsUnset = width === undefined && height === undefined
	const classList = new TokenList(sizeIsUnset ? 'mw-default-size' : undefined, className)

	return (
		<span className={classList.length > 0 ? classList.toString() : undefined} typeof="mw:File">
			{wrapper}
		</span>
	)
}
