import '@/lib/server-only'

import { pick, sleep } from 'radashi'

import { MwApiCall } from '@/lib/mw-api'
import { normalizeWikiTitle } from '@/lib/wiki'

import { WikiImage, type WikiImageProps } from '.'

// TODO: 通过机器人将图片标记为正在使用
export async function WikiImageServerOnly({ width, height, ...props }: WikiImageProps) {
	if (props.originalWidth || (width === undefined && height === undefined))
		return <WikiImage {...props} />

	const { src, srcSet, originalWidth, originalHeight } = await getImageThumbs(
		`File:${normalizeWikiTitle(props.file)}`,
		{
			width,
			height,
		} as { width: number; height?: number } | { width?: number; height: number },
	)

	return (
		<WikiImage
			src={src}
			srcSet={srcSet}
			width={width}
			height={height}
			originalWidth={originalWidth}
			originalHeight={originalHeight}
			{...props}
		/>
	)
}

const THROTTLE_INTERVAL_MS = 500
const queue = new Set<string>()
type QueryResult = Map<
	string,
	{
		width: number
		height: number
		thumbwidth: number
		thumbheight: number
		thumburl: string
		responsiveUrls?: Record<`${number}`, string>
	}
>
type WaitQueryResultPromise = Promise<QueryResult>
type ResponsiveUrls = Record<`${number}`, string>
let waitNextQueryPromise: Promise<WaitQueryResultPromise> | undefined = undefined

async function getImageThumbs(
	normalizedTitle: string,
	{ width, height }: { width: number; height?: number } | { width?: number; height: number },
): Promise<{
	src: string
	srcSet?: string
	thumbwidth: number
	thumbheight: number
	originalWidth: number
	originalHeight: number
}> {
	queue.add(normalizedTitle)
	waitNextQueryPromise ??= new Promise((resolve) => {
		void sleep(THROTTLE_INTERVAL_MS).then(() => {
			waitNextQueryPromise = undefined
			const titles = [...queue]
			queue.clear()

			resolve(
				(async () => {
					const call = new MwApiCall({
						titles,
						imageinfo: { prop: ['dimensions', 'url'], urlwidth: width, urlheight: height },
					})

					const result: QueryResult = new Map()

					for await (const chunk of call.query<{
						imageinfo?: [
							{
								size: number
								width: number
								height: number
								thumburl: string
								thumbwidth: number
								thumbheight: number
								responsiveUrls?: ResponsiveUrls
								url: string
								descriptionurl: string
								descriptionshorturl: string
							},
						]
					}>()) {
						chunk.forEach(({ title, imageinfo }) => {
							if (!imageinfo) return

							result.set(
								title,
								pick(imageinfo[0], [
									'width',
									'height',
									'thumbwidth',
									'thumbheight',
									'thumburl',
									'responsiveUrls',
								]),
							)
						})
					}

					return result
				})(),
			)
		})
	})

	const result = await waitNextQueryPromise
	const {
		width: originalWidth,
		height: originalHeight,
		thumbwidth,
		thumbheight,
		thumburl,
		responsiveUrls,
	} = result.get(normalizedTitle)!

	return {
		src: thumburl,
		srcSet: responsiveUrls && getSrcSet(responsiveUrls),
		thumbwidth,
		thumbheight,
		originalWidth,
		originalHeight,
	}
}

function getSrcSet(responsiveUrls: ResponsiveUrls) {
	const candidate = Object.entries(responsiveUrls).map(
		([scale, url]) => [Number.parseFloat(scale), url] as const,
	)
	candidate.sort((a, b) => a[0] - b[0])
	return candidate.map(([scale, url]) => `${url} ${scale}x`).join(',')
}
