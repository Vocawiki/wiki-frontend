import type { CSSProperties } from 'react'

import * as Wiki from '~/components/wikitext'

interface BilibiliVideo {
	title: string
	videoId: string
	uploadedAt: Date
	coverFile?: string
	bgColor: string
	fgColor: string
}

const videos: BilibiliVideo[] = [
	{
		title: '历届VCCL新人榜榜首速览——有你推的P主吗？',
		videoId: 'BV1PZA6z2Egu',
		uploadedAt: new Date('2026-02-26 18:16:23'),
		bgColor: '#6b50a4',
		fgColor: '#fff',
	},
	{
		title: '26冬结果揭晓！VCCL历届冠军回顾',
		videoId: 'BV1EefBBDE5E',
		uploadedAt: new Date('2026-02-23T22:26:30+0800'),
		bgColor: '#00868c',
		fgColor: '#fff',
	},
]

export function BilibiliVideos() {
	return (
		<div className="[&_a]:auto-interact-fx">
			<div className="mb-2 grid items-center justify-start gap-x-2 gap-y-2 [grid-template:'avatar_title_link'auto'avatar_sub_link'auto/auto_1fr_auto] main-sm:[grid-template:'avatar_title_link_sub']">
				<Wiki.Image
					file="术力口百科姬头像.jpg"
					className="size-14 overflow-hidden rounded-max shadow-sm [grid-area:avatar]"
					width={64}
					height={64}
				/>
				<h2 className="text-lg leading-none font-semibold [grid-area:title] not-main-sm:self-end">
					术力口百科姬
				</h2>
				<div className="contents text-sm leading-none font-medium text-white *:w-max *:rounded-max *:bg-(--background-color-progressive) *:px-4! *:py-3! *:[grid-area:link] not-main-sm:*:justify-self-end main-sm:*:px-3.25! main-sm:*:py-2!">
					<Wiki.Link href="https://space.bilibili.com/10003900">哔哩哔哩</Wiki.Link>
				</div>
				<div className="text-sm leading-none text-subtle [grid-area:sub] not-main-sm:self-start">
					关注我们的官方账号
				</div>
			</div>
			<ul className="grid grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-4">
				{videos
					.toSorted((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
					.map((video) => (
						<VideoCard key={video.videoId} {...video} />
					))}
			</ul>
		</div>
	)
}

const dateFormatter = Intl.DateTimeFormat('zh-Hans-CN')

function VideoCard({
	title,
	videoId,
	uploadedAt,
	coverFile = `${title}.png`,
	bgColor,
	fgColor,
}: BilibiliVideo) {
	return (
		<li
			className="contents *:grid *:grid-rows-[1fr_auto] *:overflow-hidden *:rounded-sm *:bg-(--bg-color)! *:text-(--fg-color) *:shadow-sm"
			style={{ '--bg-color': bgColor, '--fg-color': fgColor } as CSSProperties}
		>
			<Wiki.Link href={`https://www.bilibili.com/video/${videoId}`}>
				<Wiki.Image file={coverFile} link={false} width={300} className="[&_img]:w-full" />
				<div className="space-y-1 p-2">
					<div className="line-clamp-2 h-[2lh] text-sm leading-tight font-medium">{title}</div>
					<div className="text-xs leading-none opacity-90">{dateFormatter.format(uploadedAt)}</div>
				</div>
			</Wiki.Link>
		</li>
	)
}
