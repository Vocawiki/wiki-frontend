import '@/lib/server-only'

import assert from 'node:assert/strict'

import PQueue from 'p-queue'
import { sleep } from 'radashi'

import { MwApiCall } from '@/lib/mw-api'
import { normalizeWikiTitle } from '@/lib/wiki'
import { referenceFile } from '@/tools/file-usage'

import { WikiImage, type WikiImageProps } from '.'

type WidthAndOrHeight = { width: number; height?: number } | { width?: number; height: number }

// TODO: 通过机器人将图片标记为正在使用
export async function WikiImageServerOnly(props: WikiImageProps) {
	const normalizedName = normalizeWikiTitle(props.file)
	referenceFile(normalizedName)

	const { width, height } = props
	if (props.originalWidth || (width === undefined && height === undefined)) {
		return <WikiImage {...props} />
	}

	const result = await Promise.race([
		getWikiImageProps(normalizedName, { width, height } as WidthAndOrHeight),
		sleep(10_000),
	])
	if (!result) throw new Error(`${props.file}超时。${JSON.stringify(props)}`)
	const { src, srcSet, originalWidth, originalHeight } = result

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
	normalizedName: string,
	size: WidthAndOrHeight,
): Promise<{ src: string; srcSet?: string; originalWidth: number; originalHeight: number }> {
	const { thumbUrl, responsiveUrls, width, height } = await getThumb(`File:${normalizedName}`, size)
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
	responsiveUrls: ResponsiveUrls | undefined
}
type ResponsiveUrls = Record<`${number}`, string>
interface ImagePromiseAndResolver {
	promise: Promise<ImageThumbQueryResult>
	resolve: (result: ImageThumbQueryResult) => void
}

/** 键是缩略图宽度，值是标题集合 */
const willQueryTasks = new Map<
	`${'w' | 'h'}${number}`,
	{
		/** 键是文件标题，值是promise和该promise的resolve */
		images: Map<string, ImagePromiseAndResolver>
		willQueryTimeoutKey: ReturnType<typeof setTimeout>
	}
>()

const queryQueue = new PQueue({ concurrency: 1, timeout: 10_000 })

function getThumb(
	title: string,
	{ width, height }: WidthAndOrHeight,
): Promise<ImageThumbQueryResult> {
	const taskKey: `${'w' | 'h'}${number}` = width !== undefined ? `w${width}` : `h${height!}`
	const task = willQueryTasks.getOrInsertComputed(taskKey, () => {
		const images = new Map<string, ImagePromiseAndResolver>()
		return {
			images,
			willQueryTimeoutKey: setTimeout(() => {
				willQueryTasks.delete(taskKey)
				void queryQueue.add(() =>
					query(
						// 与taskKey一致
						width !== undefined ? { width } : { height: height! },
						images,
					),
				)
			}, THROTTLE_INTERVAL_MS),
		}
	})

	const getThumbPromiseAndResolver = task.images.getOrInsertComputed(title, () => {
		let resolve: (result: ImageThumbQueryResult) => void
		const promise = new Promise<ImageThumbQueryResult>((res) => {
			resolve = res
		})
		// @ts-expect-error resolve已赋值，并非赋值前使用变量
		return { promise, resolve }
	})

	return getThumbPromiseAndResolver.promise
}

async function query(
	{ width, height }: WidthAndOrHeight,
	resolvers: Map<string, ImagePromiseAndResolver>,
) {
	const titles = [...resolvers.keys()]
	const call = new MwApiCall({
		titles,
		imageinfo: { prop: ['dimensions', 'url'], limit: 1, urlwidth: width, urlheight: height },
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
	}>({ ignoreContinue: ['imageinfo'] })) {
		chunk.forEach(({ title, imageinfo }) => {
			if (!imageinfo) return

			const [
				{
					width,
					height,
					thumbwidth: thumbWidth,
					thumbheight: thumbHeight,
					thumburl: thumbUrl,
					responsiveUrls,
				},
			] = imageinfo
			const resolve = resolvers.get(title)?.resolve
			assert(resolve, `未找到对${title}的resolver`)
			resolve({ width, height, thumbWidth, thumbHeight, thumbUrl, responsiveUrls })
			resolvers.delete(title)
		})
	}
}
