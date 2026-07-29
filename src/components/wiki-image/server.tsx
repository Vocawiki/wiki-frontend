import '@/lib/server-only'

import assert from 'node:assert/strict'

import PQueue from 'p-queue'

import { MwApiCall } from '@/lib/mw-api'
import { normalizeWikiTitle } from '@/lib/wiki'

import { WikiImage, type WikiImageProps } from '.'

type WidthAndOrHeight = { width: number; height?: number } | { width?: number; height: number }

// TODO: 通过机器人将图片标记为正在使用
export async function WikiImageServerOnly(props: WikiImageProps) {
	const { width, height } = props
	if (props.originalWidth || (width === undefined && height === undefined))
		return <WikiImage {...props} />

	const { src, srcSet, originalWidth, originalHeight } = await getWikiImageProps(props.file, {
		width,
		height,
	} as WidthAndOrHeight)

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

async function getWikiImageProps(
	fileName: string,
	size: WidthAndOrHeight,
): Promise<{ src: string; srcSet?: string; originalWidth: number; originalHeight: number }> {
	const { thumbUrl, responsiveUrls, width, height } = await getThumb(
		`File:${normalizeWikiTitle(fileName)}`,
		size,
	)
	return {
		src: thumbUrl,
		srcSet: responsiveUrls && getSrcSet(responsiveUrls),
		originalWidth: width,
		originalHeight: height,
	}
}

function getSrcSet(responsiveUrls: ResponsiveUrls) {
	const candidate = Object.entries(responsiveUrls).map(
		([scale, url]) => [Number.parseFloat(scale), url] as const,
	)
	candidate.sort((a, b) => a[0] - b[0])
	return candidate.map(([scale, url]) => `${url} ${scale}x`).join(',')
}

const THROTTLE_INTERVAL_MS = 500

interface ImageThumbQueryResult {
	width: number
	height: number
	thumbWidth: number
	thumbHeight: number
	thumbUrl: string
	responsiveUrls?: ResponsiveUrls
}
type ResponsiveUrls = Record<`${number}`, string>

/** 键是缩略图宽度，值是标题集合 */
const willQueryTasks = new Map<
	`${'w' | 'h'}${number}`,
	{
		/** 键是文件标题，值是Promise的resolve */
		resolvers: Map<string, (result: ImageThumbQueryResult) => void>
		willQueryTimeoutKey: ReturnType<typeof setTimeout>
	}
>()

const queryQueue = new PQueue({ concurrency: 1 })

function getThumb(
	title: string,
	{ width, height }: WidthAndOrHeight,
): Promise<ImageThumbQueryResult> {
	const taskKey: `${'w' | 'h'}${number}` = width !== undefined ? `w${width}` : `h${height!}`
	const task = willQueryTasks.getOrInsertComputed(taskKey, () => {
		const resolvers = new Map<string, (result: ImageThumbQueryResult) => void>()
		return {
			resolvers,
			willQueryTimeoutKey: setTimeout(() => {
				willQueryTasks.delete(taskKey)
				void queryQueue.add(() =>
					query(
						// 与taskKey一致
						width !== undefined ? { width } : { height: height! },
						resolvers,
					),
				)
			}, THROTTLE_INTERVAL_MS),
		}
	})

	let resolve: (result: ImageThumbQueryResult) => void
	const promise = new Promise<ImageThumbQueryResult>((res) => {
		resolve = res
	})
	// @ts-expect-error resolve已赋值，并非赋值前使用变量
	task.resolvers.set(title, resolve)

	return promise
}

async function query(
	{ width, height }: WidthAndOrHeight,
	resolvers: Map<string, (result: ImageThumbQueryResult) => void>,
) {
	const titles = [...resolvers.keys()]
	const call = new MwApiCall({
		titles,
		imageinfo: { prop: ['dimensions', 'url'], urlwidth: width, urlheight: height },
	})

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

			const [
				{ width, height, thumbwidth: thumbWidth, thumbheight: thumbHeight, thumburl: thumbUrl },
			] = imageinfo
			const resolve = resolvers.get(title)
			assert(resolve, `未找到对${title}的resolver`)
			resolve({ width, height, thumbWidth, thumbHeight, thumbUrl })
			resolvers.delete(title)
		})
	}
}
