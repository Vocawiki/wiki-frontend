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
		uploadedAt: new Date('2026-02-26T18:16:23+0800'),
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

const accountURL = 'https://space.bilibili.com/10003900'

export function BilibiliVideos() {
	return (
		<div className="[&_a]:auto-interact-fx">
			<div className="mb-2 grid items-center justify-start gap-x-2 gap-y-1 [grid-template:'avatar_title_link'auto'avatar_sub_link'auto/auto_1fr_auto] main-2xs:grid-cols-[auto_auto_auto] main-sm:[grid-template:'avatar_title_link_sub']">
				<Wiki.Image
					file="术力口百科姬头像.jpg"
					className="size-12 overflow-hidden rounded-max shadow-sm [grid-area:avatar] main-2xs:size-14"
					width={64}
					height={64}
					link={false}
					alt=""
				/>
				<h2 className="leading-none font-semibold [grid-area:title] not-main-sm:self-end main-2xs:text-lg">
					术力口百科姬
				</h2>
				<div className="contents text-sm leading-none font-medium text-white *:w-max *:rounded-max *:bg-(--background-color-progressive)! *:px-3.25! *:py-2.5! *:[grid-area:link] not-main-sm:*:justify-self-end">
					<Wiki.Link href={accountURL}>哔哩哔哩</Wiki.Link>
				</div>
				<div className="text-xs leading-none text-subtle [grid-area:sub] not-main-sm:self-start main-2xs:text-sm">
					<Wiki.Link href={accountURL}>关注我们的官方账号</Wiki.Link>
				</div>
			</div>
			<ul className="grid grid-cols-2 gap-2 not-main-2xs:force-inline-full not-main-2xs:pr-[max(0.5rem,env(safe-area-inset-right))] not-main-2xs:pl-[max(0.5rem,env(safe-area-inset-left))] main-sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] main-sm:gap-3">
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
			className="contents *:grid *:grid-rows-[1fr_auto] *:overflow-hidden *:rounded-sm *:bg-(--bg-color)! *:text-(--fg-color) *:shadow-sm [&_img]:w-full"
			style={{ '--bg-color': bgColor, '--fg-color': fgColor } as CSSProperties}
		>
			<Wiki.Link href={`https://www.bilibili.com/video/${videoId}`}>
				<Wiki.Image file={coverFile} link={false} width={360} />
				<div className="space-y-1 p-2">
					<div className="line-clamp-2 h-[2lh] text-sm leading-tight font-medium main-sm:text-sm">
						{title}
					</div>
					<div className="text-xs leading-none opacity-90">{dateFormatter.format(uploadedAt)}</div>
				</div>
			</Wiki.Link>
		</li>
	)
}
