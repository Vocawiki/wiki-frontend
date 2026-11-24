import { cn } from 'cn'
import type { CSSProperties } from 'react'

import { formatNumber } from '@/lib/number'
import { WikiImageServerOnly } from '~/components/wiki-image/server'
import * as Wiki from '~/components/wikitext'

import {
	loadTopicData,
	MAIN_ARTICLE,
	OFFICIAL_SITE_URL,
	PARTICIPATION_TAG_URL,
	SUBMITTED_COUNT,
} from './data'
import { Songs } from './songs'

/** logo */
const LOGO = '无色透名祭4LOGO.svg'

export async function FlashTopic() {
	const data = await loadTopicData()

	return (
		<div
			className={cn(
				'preflight relative flow-root text-(--ft-ink) [&_a]:auto-interact-fx',
				'[--ft-accent:#f4664a] [--ft-bg:#d2f9ff] [--ft-ink:#173f49] [--ft-line:#d5e8ed] [--ft-primary:#0e4d5f] [--ft-soft:#eaf6f8] dark:[--ft-bg:#002628] dark:[--ft-ink:#dbeef2] dark:[--ft-line:#24363b] dark:[--ft-primary:#6fd3e4] dark:[--ft-soft:#132930]',
			)}
		>
			{/* 背景层 */}
			<div className="fill ignore-article-inline-padding bg-(--ft-bg) bg-[url(/images/b/b7/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%AD4kv-bg.webp)] bg-cover bg-top dark:brightness-40 dark:contrast-300" />
			{/* 人物层 */}
			<div className="fill grid grid-rows-[28rem_auto] *:relative">
				<div className="-mx-10 bg-[url(/images/thumb/0/00/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%ADillust04.png/800px-%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%ADillust04.png.webp)] bg-size-[auto_100%] bg-position-[calc(50%+10rem)_0] bg-no-repeat px-10 dark:brightness-90 main-not-sm:invisible" />
				<div className="ignore-article-inline-padding -mt-48 grow bg-linear-to-b from-transparent to-(--ft-bg) to-[12rem]" />
			</div>
			<div className="fill ignore-article-inline-padding border-y border-(--ft-line)" />

			<div className="absolute top-4 right-0 text-xs leading-none opacity-60">
				<span className="main-not-sm:hidden">
					插画 <span lang="ja">いよわ</span> ·
				</span>
				<span className="main-sm:hidden">图像</span> © DWANGO
			</div>

			<div className="relative pt-8 pb-6">
				{/* 标题 */}
				<h2>
					<div className="flex items-center gap-2 leading-none font-semibold tracking-[0.1875em] text-(--ft-primary) main-sm:text-lg">
						<span className="h-4 w-0.75 rounded-full bg-(--ft-accent)" />
						专题
						<span className="visually-hidden">：</span>
					</div>
					<Wiki.Functions.Link page={MAIN_ARTICLE} className="my-8 block w-max main-not-sm:mx-auto">
						<WikiImageServerOnly
							file={LOGO}
							alt="无色透名祭4"
							width={480}
							className="h-12 w-auto dark:filter-(--filter-dark) main-xs:h-14 main-md:h-16"
							style={
								{
									'--filter-dark':
										'drop-shadow(-1px 0 3px #e5e5e5) drop-shadow(1px 0px 3px #e5e5e5) drop-shadow(-1px 1px 2px #e5e5e5) drop-shadow(1px 1px 2px #e5e5e5)',
								} as CSSProperties
							}
						/>
					</Wiki.Functions.Link>
				</h2>

				<p className="mx-2 text-sm leading-relaxed opacity-90 main-not-sm:text-center">
					以“全员透名”为主题的VOCALOID歌曲匿名投稿活动。
				</p>

				<div className="mt-4 flex flex-wrap gap-2 main-not-sm:justify-center">
					<Button page={MAIN_ARTICLE} variant="primary">
						完整介绍
					</Button>
					<Button href={OFFICIAL_SITE_URL}>活动官网</Button>
					<Button href={PARTICIPATION_TAG_URL}>全部{formatNumber(SUBMITTED_COUNT)}首曲目</Button>
				</div>

				<Schedule className="mt-6" />

				<Songs data={data} className="mt-6" />
			</div>
		</div>
	)
}

/** 时间节点 */
function Schedule({ className }: { className?: string }) {
	return (
		<ol
			className={cn('grid grid-cols-2 gap-2.5 main-xs:grid-cols-3 main-md:grid-cols-5', className)}
			style={{ '--bg': '#fff' } as CSSProperties}
		>
			<ScheduleItem date="9/15" time="12:00" label="投稿开始" />
			<ScheduleItem date="9/28" time="11:00" label="投稿截止" />
			<ScheduleItem date="11/20" time="13:00" label="先行公开" />
			<ScheduleItem date="11/20" time="18:00" label="正式公开" />
			<ScheduleItem date="11/23" time="19:00" label="投稿者公开" />
		</ol>
	)
}

function ScheduleItem({ date, time, label }: { date: string; time: string; label: string }) {
	return (
		<li
			key={`${date}${time}`}
			className="space-y-1 rounded-md border border-white bg-white/80 px-3 py-2 text-center backdrop-blur-xs backdrop-saturate-200 dark:border-(--ft-primary)/25 dark:bg-(--ft-soft)/60 main-md:py-3"
		>
			<div className="text-xs leading-none opacity-80">{label}</div>
			<div className="text-sm leading-none font-semibold text-(--ft-primary) tabular-nums">
				{date} <span className="font-normal opacity-80">{time}</span>
			</div>
		</li>
	)
}

function Button({
	variant = 'outline',
	children,
	...props
}: {
	variant?: 'primary' | 'outline'
	children: React.ReactNode
} & (
	| {
			page: string
	  }
	| { href: string }
)) {
	const className = cn(
		'inline-flex items-center rounded-max px-3.5! py-2! text-sm leading-none font-medium',
		{
			'bg-(--ft-primary)! text-(--ft-soft)': variant === 'primary',
			'border border-(--ft-primary)/25 bg-(--ft-soft)! text-(--ft-primary)': variant === 'outline',
		},
	)

	return 'page' in props ? (
		<Wiki.Functions.Link page={props.page} className={className}>
			{children}
		</Wiki.Functions.Link>
	) : (
		<Wiki.Functions.ExternalLink href={props.href} className={className}>
			{children}
		</Wiki.Functions.ExternalLink>
	)
}
