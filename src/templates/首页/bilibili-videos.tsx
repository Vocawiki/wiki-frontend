import type { CSSProperties } from 'react'

import { WikiImageServerOnly } from '@/src/components/wiki-image/server'
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
		title: '这些术曲都犯规了？VCCL2026夏：除名/退赛歌曲排行榜',
		videoId: 'BV1Ex4X6nERS',
		uploadedAt: new Date('2026-08-30T17:30:00+0800'),
		coverFile: 'VCCL2026夏：除名退赛歌曲排行榜.jpg',
		bgColor: '#43349e',
		fgColor: '#fff',
	},
	{
		title: '【新曲速递】每周术力口佳作整理｜ボカコレ（VCCL）特别刊',
		videoId: 'BV1w6hG6pE2B',
		uploadedAt: new Date('2026-08-25T19:00:00+0800'),
		coverFile: '【新曲速递】每周术力口佳作整理｜ボカコレ(VCCL)特别刊.jpg',
		bgColor: '#44889c',
		fgColor: '#fff',
	},
	{
		title: 'bilibili外语术力口最慢100w排行，谁才是真正的区王？',
		videoId: 'BV1xSbh63E1S',
		uploadedAt: new Date('2026-08-17T12:00:00+0800'),
		coverFile: 'BiliBili外语术力口最慢100w排行.jpg',
		bgColor: '#e08d28',
		fgColor: '#fff',
	},
	{
		title: 'bilibili外语术力口最慢10w TOP25，谁才是真正的区王？',
		videoId: 'BV1pR396sEiH',
		uploadedAt: new Date('2026-08-02T20:00:00+0800'),
		coverFile: 'Bilibili外语术力口最慢10wTOP25.jpg',
		bgColor: '#075ec7',
		fgColor: '#fff',
	},
	{
		title: '三站争霸！一口气看完B站/Niconico/YouTube 最速千万术曲',
		videoId: 'BV17h9xBiEJv',
		uploadedAt: new Date('2026-04-30T18:30:00+0800'),
		coverFile: '三站争霸！一口气看完B站_Niconico_YouTube_最速千万术曲.jpg',
		bgColor: '#744b34',
		fgColor: '#fff',
	},
	{
		title: '高手云集！历届VCCL REMIX榜首回顾',
		videoId: 'BV1sBAnzZE2e',
		uploadedAt: new Date('2026-03-20T17:30:00+0800'),
		bgColor: '#468801',
		fgColor: '#fff',
	},
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
		<div className="preflight [&_a]:auto-interact-fx">
			<div className="mb-2 grid items-center justify-start gap-x-2 gap-y-1 [grid-template:'avatar_title_link'auto'avatar_sub_link'auto/auto_1fr_auto] main-2xs:grid-cols-[auto_auto_auto] main-sm:[grid-template:'avatar_title_link_sub']">
				<Wiki.Image
					file="术力口百科姬头像.jpg"
					className="size-12 overflow-hidden rounded-max shadow-sm [grid-area:avatar] main-2xs:size-14"
					suppressSbWikitextError
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
				<div className="-my-3 text-xs leading-none text-subtle [grid-area:sub] *:block *:py-3 not-main-sm:self-start main-2xs:text-sm">
					<Wiki.Link href={accountURL}>关注我们的官方账号</Wiki.Link>
				</div>
			</div>
			<ul className="grid grid-cols-2 gap-1.5 not-main-2xs:ignore-article-inline-padding not-main-2xs:pr-[max(6px,env(safe-area-inset-right))] not-main-2xs:pl-[max(6px,env(safe-area-inset-left))] main-2xs:gap-2 main-sm:grid-cols-[repeat(auto-fill,minmax(15rem,1fr))]">
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
			className="group contents *:grid *:grid-rows-[1fr_auto] *:overflow-hidden *:rounded-md *:bg-(--bg-color)! *:text-(--fg-color) *:shadow-sm"
			style={{ '--bg-color': bgColor, '--fg-color': fgColor } as CSSProperties}
		>
			<Wiki.Link href={`https://www.bilibili.com/video/${videoId}/`}>
				<WikiImageServerOnly
					file={coverFile}
					width={360}
					className="w-full transition-transform group-hover:scale-110"
				/>
				<div className="relative space-y-1 bg-(--bg-color) p-2">
					<div className="line-clamp-2 h-[2lh] text-sm leading-tight font-medium main-sm:text-sm">
						{title}
					</div>
					<div className="text-xs leading-none opacity-90">{dateFormatter.format(uploadedAt)}</div>
				</div>
			</Wiki.Link>
		</li>
	)
}
