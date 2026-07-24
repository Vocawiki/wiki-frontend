'use client'

import { FastAverageColor } from 'fast-average-color'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { MwApiCall } from '@/lib/mw-api'
import { cn } from '@/lib/utils'
import { WikiInternalLink } from '@/src/components/wiki-link'

import type { PartialPageInfo } from './types'

const THUMB_WIDTH = 160 // 与Citizen搜索框的预览图大小相同，如遇相同条目可节省流量

export default function LatestArticleList({ pages }: { pages: PartialPageInfo[] }) {
	const [fetchedPages, setFetchedPages] = useState(pages)

	useEffect(() => {
		/** 从标题到信息 */
		const titleToInfoMap = new Map<string, PartialPageInfo>(
			pages.map((x) => [x.title, { title: x.title, href: x.href }]),
		)

		const apiCall = new MwApiCall({
			titles: [...titleToInfoMap.keys()],
			pageimages: {
				thumbsize: THUMB_WIDTH,
				prop: 'thumbnail',
				license: 'any',
				limit: 'max',
			},
			extracts: {
				chars: 100,
				intro: true,
				plaintext: true,
				limit: 'max',
			},
		})

		void (async () => {
			for await (const chunk of apiCall.query<{
				thumbnail?: {
					source: string
					width: number
					height: number
				}
				extract?: string
			}>()) {
				chunk.forEach((page) => {
					const record = titleToInfoMap.get(page.title)
					if (!record) {
						console.warn(`map中不存在键为“${page.title}”的映射。map：`, titleToInfoMap)
						return
					}
					if (page.thumbnail !== undefined) {
						record.image = page.thumbnail
					}
					if (page.extract !== undefined) {
						record.summary = page.extract
					}
				})
				setFetchedPages([...titleToInfoMap.values()])
			}
			setFetchedPages(
				Array.from(titleToInfoMap.values(), (page) => ({
					thumbnail: null,
					summary: '',
					...page,
				})),
			)
		})()
	}, [pages])

	return (
		<div className="main-2xs:ignore-article-max-width">
			<PageList pages={fetchedPages} className="mx-auto max-w-480" />
		</div>
	)
}

function PageList({ pages, className }: { pages: PartialPageInfo[]; className?: string }) {
	const facRef = useRef<FastAverageColor | null>(null)
	const shownPagesNumber = pages.length > 23 ? pages.length - 3 : Math.min(pages.length, 20)

	return (
		<ul
			className={cn(
				'grid auto-cols-80 grid-flow-row grid-rows-4 gap-2 overflow-x-auto py-2 *:contents',
				className,
			)}
		>
			{pages.slice(0, shownPagesNumber).map((page) => (
				<li key={page.href}>
					<PageCard {...page} facRef={facRef} />
				</li>
			))}
			<li>
				<SeeMoreButton pages={pages.slice(shownPagesNumber)} />
			</li>
		</ul>
	)
}

function PageCard({
	title,
	href,
	image,
	summary,
	facRef,
}: { title: string; facRef: React.RefObject<FastAverageColor | null> } & PartialPageInfo) {
	const imgRef = useRef<HTMLImageElement | null>(null)
	const [themeColor, setThemeColor] = useState<
		{ color: string; isDark: boolean; supportsOklch: boolean } | undefined
	>(undefined)

	useEffect(() => {
		if (!imgRef.current) return

		facRef.current ??= new FastAverageColor()
		void facRef.current
			.getColorAsync(imgRef.current, {
				algorithm: 'dominant',
				mode: 'speed',
				left: THUMB_WIDTH * 0.6,
				width: THUMB_WIDTH * 0.4,
			})
			.then((color) => {
				setThemeColor({
					color: color.rgb,
					isDark: color.isDark,
					supportsOklch: CSS.supports(
						'color',
						'oklch(from red clamp(0.85, l, 0.94) min(c, 0.1) h)',
					),
				})
			})
	}, [imgRef.current])

	return (
		<WikiInternalLink
			href={href}
			title={title}
			className={cn(
				'flex overflow-hidden rounded-md shadow-sm auto-interact-fx transition-colors duration-1000 ease-linear',
				themeColor
					? themeColor.supportsOklch
						? 'bg-(--bg-color-light) text-(--text-color-light) shadow-(color:--text-color-light)/14 dark:bg-(--bg-color-dark) dark:text-(--text-color-dark)'
						: ['bg-(--theme-color)', themeColor.isDark ? 'text-white' : 'text-black']
					: 'bg-(--background-color-interactive-subtle)',
			)}
			style={
				themeColor
					? ({
							'--theme-color': themeColor.color,
							'--bg-color-light': `oklch(from var(--theme-color) max(0.92, l) calc((c + min(c, 0.15) * 2 + min(c, 0.05) * 3) / 6) h)`,
							'--bg-color-dark': `oklch(from var(--theme-color) clamp(0.2, l, 0.3) calc((c + min(c, 0.15) * 2 + min(c, 0.05) * 3) / 6) h)`,
							'--text-color-light': `oklch(from var(--theme-color) min(0.3, l) max(c, 0.15) h)`,
							'--text-color-dark': `oklch(from var(--theme-color) clamp(0.85, l, 0.94) min(c, 0.1) h)`,
						} as CSSProperties)
					: undefined
			}
		>
			<div className="relative w-22 shrink-0 mask-r-from-12 main-md:w-26">
				{image ? (
					<img
						ref={imgRef}
						src={image.source}
						loading="lazy"
						alt=""
						className="absolute size-full object-cover object-[65%]"
					/>
				) : (
					<div
						aria-hidden
						className="absolute top-1/2 left-[46%] -translate-1/2 text-[4rem] font-bold text-(--color-disabled) select-none"
					>
						{firstCharacter(title)}
					</div>
				)}
			</div>
			<div className="relative flex flex-col py-2.5 pr-2 pl-0">
				<h3 className="-mt-1.5 line-clamp-1 text-base leading-[calc(1em+12px)] font-medium">
					{title}
				</h3>
				<p
					className={cn(
						'-my-px line-clamp-2 h-[calc(2em+4px)] grow text-sm leading-[calc(1em+2px)]',
						summary ? 'opacity-80' : 'opacity-60',
					)}
					style={{ height: '2lh' }}
				>
					{summary === undefined ? '加载中…' : summary === '' ? '暂无摘要' : cleanSummary(summary)}
				</p>
			</div>
		</WikiInternalLink>
	)
}

function SeeMoreButton({ pages }: { pages: PartialPageInfo[] }) {
	const images = pages
		.map(({ image }) => image)
		.filter((x) => x !== undefined)
		.slice(0, 3)
	const image3 = images.pop()
	const image2 = images.pop()
	const image1 = images.pop()

	return (
		<WikiInternalLink
			href="/Special:NewPages"
			title="前往新页面列表"
			className="group relative flex overflow-hidden rounded-md bg-(--background-color-progressive-subtle) font-medium shadow-sm auto-interact-fx"
		>
			<div
				className="relative z-1 -mr-4.5 flex-center w-31 shrink-0 pr-3 transition-[margin] ease-initial group-hover:-ml-4"
				style={{
					background:
						'linear-gradient(90deg, var(--background-color-progressive-subtle) 2rem, transparent 2rem),' +
						'radial-gradient(circle at calc(3.5rem) 50%, var(--background-color-progressive-subtle) calc(3.75rem), rgba(0,0,0,.1) calc(3.75rem + 1px), transparent calc(4.125rem))',
				}}
			>
				<div className="leading-none">
					查看
					<br className="select-none" />
					更多
				</div>
			</div>
			<div className="flex grow -space-x-8">
				{/* FIXME: 图片不为3个时显示异常 */}
				{image1 && (
					<div
						className="grow bg-cover bg-center"
						style={{ backgroundImage: `url(${image1.source})` }}
					/>
				)}
				{image2 && (
					<div
						className="grow basis-4 bg-cover bg-center"
						style={{
							backgroundImage: `url(${image2.source})`,
							clipPath: 'polygon(2rem 0, 100% 0, 100% 100%, 0 100%)',
						}}
					/>
				)}
				{image3 && (
					<div
						className="grow basis-2 bg-cover bg-center"
						style={{
							backgroundImage: `url(${image3.source})`,
							clipPath: 'polygon(2rem 0, 100% 0, 100% 100%, 0 100%)',
						}}
					/>
				)}
			</div>
			<div className="fill shadow-[inset_0_1px_.5rem_rgba(0,0,0,.2)]" />
		</WikiInternalLink>
	)
}

function cleanSummary(summary: string) {
	return summary.replaceAll(/^\s*《.+?》(?:（.+?）)?是\s*|[。\s]+$/g, '')
}

const firstCharacter: (str: string) => string = (() => {
	if (!('Segmenter' in Intl)) {
		return (str) => {
			if (str === '') return ''
			return String.fromCodePoint(str.codePointAt(0)!)
		}
	}

	const segmenter = new Intl.Segmenter('zh', { granularity: 'grapheme' })
	return (str) => {
		if (!str) return ''
		const [first] = segmenter.segment(str)
		return first!.segment
	}
})()
