import { TokenList } from '@/lib/utils'

import { WikiImageServerOnly } from '../../wiki-image/server'
import { DevPreviewImageLink } from './dev-preview-image-link'
import type { WikitextImageProps } from '.'

export function WikitextImageDevPreview({
	file,
	width,
	height,
	link,
	alt,
	className,
}: WikitextImageProps) {
	const img = (
		<WikiImageServerOnly
			alt={alt}
			file={file}
			width={width}
			height={height}
			className="mw-file-element"
		/>
	)
	let wrapper
	if (link === undefined) {
		wrapper = <DevPreviewImageLink fileName={file}>{img}</DevPreviewImageLink>
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
		// eslint-disable-next-line react/no-unknown-property
		<span className={classList.length > 0 ? classList.toString() : undefined} typeof="mw:File">
			{wrapper}
		</span>
	)
}
