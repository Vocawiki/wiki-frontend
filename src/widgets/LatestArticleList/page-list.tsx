'use client'

import { ScrollArea } from '@base-ui/react/scroll-area'
import { FastAverageColor } from 'fast-average-color'
import { useEffect, useRef, useState, type CSSProperties } from 'react'

import { MwApiCall } from '@/lib/mw-api'
import { cn } from '@/lib/utils'
import { WikiInternalLink } from '@/src/components/wiki-link'

import type { PartialPageInfo } from './types'

const THUMB_WIDTH = 160 // 与Citizen搜索框的预览图大小相同，如遇相同条目可节省流量

export function LatestArticleList({ pages }: { pages: PartialPageInfo[] }) {
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
					image: null,
					summary: '',
					...page,
				})),
			)
		})()
	}, [pages])

	return <HorizontalScrollablePageList pages={fetchedPages} />
}

export function HorizontalScrollablePageList({ pages }: { pages: PartialPageInfo[] }) {
	return (
		<ScrollArea.Root className="">
			<ScrollArea.Viewport
				className="-mx-(--bleed) mask-[linear-gradient(90deg,transparent_0,black_min(var(--fade),var(--scroll-area-overflow-x-start)),black_calc(100%-min(var(--fade),var(--scroll-area-overflow-x-end,var(--fade)))),transparent_100%)] px-(--bleed) pb-6 [--fade:2rem] main-sm:[--fade:3rem] main-md:[--fade:4rem] main-lg:[--fade:5rem]"
				style={
					{
						'--bleed':
							'clamp(0px, (var(--article-container-inline-size) - var(--article-body-inline-size)) / 2, 5rem)',
					} as CSSProperties
				}
			>
				<ScrollArea.Content>
					<PageList pages={pages} />
				</ScrollArea.Content>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				className="pointer-events-none relative flex h-5 max-w-(--width-layout) items-center rounded-max bg-transparent transition-colors active:*:ease-out data-hovering:pointer-events-auto data-hovering:bg-(--background-color-neutral-subtle) data-scrolling:pointer-events-auto data-scrolling:bg-(--background-color-neutral-subtle) data-scrolling:duration-0"
				orientation="horizontal"
			>
				<ScrollArea.Thumb className="group/thumb pointer-events-auto relative h-full w-full">
					<div className="absolute inset-1.5 rounded-max bg-(--background-color-progressive)/15 transition-[inset] group-active/thumb:-inset-1" />
					<div className="absolute inset-1.75 rounded-max bg-(--background-color-progressive) opacity-80 transition-[opacity,inset,box-shadow] group-hover/thumb:inset-1 group-hover/thumb:opacity-100 group-active/thumb:inset-1.5 group-active/thumb:opacity-100 group-active/thumb:duration-75" />
				</ScrollArea.Thumb>
			</ScrollArea.Scrollbar>
		</ScrollArea.Root>
	)
}

export function PageList({ pages, className }: { pages: PartialPageInfo[]; className?: string }) {
	const facRef = useRef<FastAverageColor | null>(null)
	const shownPagesNumber = pages.length > 23 ? pages.length - 3 : Math.min(pages.length, 20)

	return (
		<ol className={cn('grid auto-cols-80 grid-flow-col grid-rows-4 gap-2 *:contents', className)}>
			{pages.slice(0, shownPagesNumber).map((page, i) => (
				<li key={page.href}>
					<PageCard {...page} facRef={facRef} index={i} />
				</li>
			))}
			<li>
				<SeeMoreButton pages={pages.slice(shownPagesNumber)} />
			</li>
		</ol>
	)
}

function PageCard({
	title,
	href,
	image,
	summary,
	facRef,
	index,
}: {
	title: string
	facRef: React.RefObject<FastAverageColor | null>
	index: number
} & PartialPageInfo) {
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
				'flex origin-bottom-right overflow-hidden rounded-md border shadow-xs auto-interact-fx transition-[color,border-color,background-color,scale,opacity] duration-[1s,1s,1s,.4s,.4s] ease-[linear,linear,linear,ease-out,ease-out] starting:scale-80 starting:opacity-0',
				themeColor
					? themeColor.supportsOklch
						? 'border-(--text-color-light)/15 bg-(--bg-color-light) text-(--text-color-light) shadow-(color:--text-color-light)/14 dark:border-(--text-color-dark)/15 dark:bg-(--bg-color-dark) dark:text-(--text-color-dark)'
						: ['bg-(--theme-color)', themeColor.isDark ? 'text-white' : 'text-black']
					: 'border-(--color-base)/15 bg-(--background-color-interactive-subtle)',
			)}
			style={{
				transitionDelay: `${Math.floor(index / 4) * 75 + (index % 4) * 75}ms`,
				...(themeColor
					? ({
							'--theme-color': themeColor.color,
							'--bg-color-light': `oklch(from var(--theme-color) max(0.92, l) calc((c + min(c, 0.15) * 2 + min(c, 0.05) * 3) / 6) h)`,
							'--bg-color-dark': `oklch(from var(--theme-color) clamp(0.2, l, 0.3) calc((c + min(c, 0.15) * 2 + min(c, 0.05) * 3) / 6) h)`,
							'--text-color-light': `oklch(from var(--theme-color) min(0.3, l) max(c, 0.15) h)`,
							'--text-color-dark': `oklch(from var(--theme-color) clamp(0.85, l, 0.94) min(c, 0.1) h)`,
						} as CSSProperties)
					: undefined),
			}}
		>
			<div className="relative w-22 shrink-0 mask-r-from-12 main-md:w-26">
				{image === undefined ? null : image === null ? (
					<div
						aria-hidden
						className="absolute top-1/2 left-[46%] -translate-1/2 text-[4rem] font-bold text-(--color-disabled) transition-opacity duration-1000 select-none starting:opacity-0"
					>
						{firstCharacter(title)}
					</div>
				) : (
					<img
						ref={imgRef}
						src={image.source}
						loading="lazy"
						alt=""
						className="absolute size-full object-cover object-[65%] transition-opacity duration-1000 starting:opacity-0"
					/>
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
