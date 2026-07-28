import { Md5 } from 'ts-md5'

import { normalizeWikiTitleForURL, withBaseURL } from '@/lib/wiki'

type ThumbaleImageProps = { originalWidth: number; originalHeight: number } & (
	| { width: number; height?: number }
	| { width?: number; height: number }
)

type WikiImageUniqueProps = {
	file: string
} &
	// | ThumbaleImageProps
	// | { originalWidth?: undefined; originalHeight?: undefined; width?: number; height?: number }
	{ originalWidth?: number; originalHeight?: number; width?: number; height?: number }

export type WikiImageProps = WikiImageUniqueProps &
	Omit<React.ComponentProps<'img'>, 'width' | 'height'>

export function WikiImage({
	file: fileName,
	width,
	height,
	originalWidth,
	originalHeight,
	...props
}: WikiImageProps) {
	const imageSrc = toImageSrc(
		fileName,
		originalWidth
			? ({ originalWidth, originalHeight, width, height } as ThumbaleImageProps)
			: undefined,
	)
	return (
		<img
			{...imageSrc}
			loading="lazy"
			decoding="async"
			width={width}
			height={height}
			data-file-width={originalWidth}
			data-file-height={originalHeight}
			{...props}
		/>
	)
}

function toImageSrc(
	fileName: string,
	_options?: ThumbaleImageProps,
): { src: string; srcSet?: string } {
	const normalizedName = normalizeWikiTitleForURL(fileName)
	const hash = Md5.hashStr(normalizedName)
	const hashPath = `${hash[0]}/${hash.slice(0, 2)}`
	const encodedName = encodeURIComponent(normalizedName)

	const originalURL = formatOriginalURL(hashPath, encodedName)
	return { src: originalURL }

	// if (!options) {
	// 	return { src: originalURL }
	// }

	// const [noScale, ...thumbs] = getThumbs({
	// 	...options,
	// 	originalURL,
	// 	getThumbURL: (width) => formatThumbURL(hashPath, encodedName, width),
	// })
	// return {
	// 	src: noScale.url,
	// 	srcSet: thumbs.map(({ scale, url }) => `${url} ${scale}x`).join(','),
	// }
}

function formatOriginalURL(hashPath: string, encodedName: string) {
	// FIXME: 路径应当是相对路径，只是当前的MoeImgTag只支持完整URL
	return withBaseURL(`/images/${hashPath}/${encodedName}`, { absolute: true })
}

/*
function formatThumbURL(hashPath: string, encodedName: string, width: number) {
	return withBaseURL(`/images/thumb/${hashPath}/${encodedName}/${width}px-${encodedName}`)
}

const SCALES = [1, 1.5, 2]

type ThumbSizes = [
	{
		scale: 1
		url: string
	},
	...{
		scale: number
		url: string
	}[],
]

function getThumbs({
	originalWidth,
	originalHeight,
	width,
	height,
	originalURL,
	getThumbURL,
}: {
	originalWidth: number
	originalHeight: number
	originalURL: string
	getThumbURL: (width: number) => string
} & ({ width: number; height?: number } | { width?: number; height: number })): ThumbSizes {
	const referenceWidth = ((): number => {
		if (height === undefined) return width!
		if (width === undefined || width / originalWidth < height / originalHeight) {
			return (height * originalWidth) / originalHeight
		}
		return width
	})()

	const sizes: {
		scale: number
		url: string
	}[] = []
	for (const scale of SCALES) {
		const thumbWidth = Math.ceil(referenceWidth * scale)
		if (thumbWidth >= originalWidth) {
			sizes.push({ scale, url: originalURL })
			break
		} else {
			sizes.push({ scale, url: getThumbURL(thumbWidth) })
		}
	}

	return sizes as ThumbSizes
}
*/
