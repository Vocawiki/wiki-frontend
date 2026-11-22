import type { CSSProperties } from 'react'

import { WikiImageServerOnly } from '~/components/wiki-image/server'
import * as Wiki from '~/components/wikitext'

import {
	loadTopicData,
	MAIN_ARTICLE,
	OFFICIAL_SITE_URL,
	PARTICIPATION_TAG_URL,
	SCHEDULE,
	SUBMITTED_COUNT,
} from './data'
import { Songs } from './songs'

/** logo */
const LOGO = '无色透名祭4LOGO.svg'
/** KV背景 */
const KEY_VISUAL_BG =
	'bg-[url(/images/b/b7/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%AD4kv-bg.webp)]'
/** KV人物 */
const KEY_VISUAL_CHARACTER =
	'bg-[url(/images/0/00/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%ADillust04.png)]'

/** 专题配色 */
const THEME = {
	'--ft-ink': '#173f49',
	'--ft-primary': '#0e4d5f',
	'--ft-solid': '#0e4d5f',
	'--ft-accent': '#f4664a',
	'--ft-line': '#d5e8ed',
	'--ft-soft': '#eaf6f8',
} as CSSProperties

/** 暗色下的变量覆盖 */
const DARK_THEME =
	'dark:[--ft-ink:#dbeef2] dark:[--ft-line:#24363b] dark:[--ft-primary:#6fd3e4] dark:[--ft-soft:#132930]'

export async function FlashTopic() {
	const data = await loadTopicData()

	return (
		<div className="preflight relative flow-root [&_a]:auto-interact-fx" style={THEME}>
			<div
				className={`relative overflow-hidden rounded-container border border-(--ft-line) bg-white dark:bg-[#0c171a] ${DARK_THEME}`}
			>
				{/* 背景层 */}
				<div
					aria-hidden
					className={`absolute inset-0 bg-cover bg-center dark:opacity-25 not-dark:mix-blend-multiply ${KEY_VISUAL_BG}`}
				/>
				{/* 人物层 */}
				<div
					aria-hidden
					className={`absolute inset-0 hidden bg-size-[auto_100%] bg-position-[calc(100%+110px)_100%] bg-no-repeat dark:opacity-40 main-sm:block ${KEY_VISUAL_CHARACTER}`}
				/>

				<div className="relative">
					{/* 顶部留白 */}
					<div className="flex h-32 flex-col items-start px-4 pt-3.5 main-sm:h-40 main-sm:px-5 main-sm:pt-4">
						<span className="flex items-center gap-2 text-base leading-none font-bold tracking-[0.2em] text-(--ft-primary) main-sm:text-lg">
							<span aria-hidden className="h-4 w-0.75 rounded-max bg-(--ft-accent)" />
							专题
						</span>
					</div>

					<div className="relative -mt-16">
						{/* logo */}
						<div className="px-4 main-sm:px-5">
							<h2 className="leading-none">
								<Wiki.Link page={MAIN_ARTICLE}>
									<WikiImageServerOnly
										file={LOGO}
										alt="无色透名祭4"
										width={480}
										className="h-11 w-auto main-sm:h-14"
									/>
								</Wiki.Link>
							</h2>
						</div>

						{/* 内容区 */}
						<div className="relative bg-linear-to-b from-transparent via-white/85 via-50% to-white dark:via-[#0c171a]/85 dark:to-[#0c171a]">
							<div className="px-4 pt-5 pb-4 main-sm:px-5">
								<p className="text-sm leading-relaxed text-(--ft-ink) opacity-70">
									以“全员透名”为主题举办的VOCALOID歌曲匿名投稿活动。
								</p>
								<div className="mt-3 flex flex-wrap gap-2">
									<Button page={MAIN_ARTICLE} variant="primary">
										完整介绍
									</Button>
									<Button href={OFFICIAL_SITE_URL}>活动官网</Button>
									<Button href={PARTICIPATION_TAG_URL}>
										全部{SUBMITTED_COUNT.toLocaleString('en-US')}首参赛曲
									</Button>
								</div>
							</div>

							<Schedule />

							<Songs data={data} />
							<Footer />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

/** 时间节点 */
function Schedule() {
	return (
		<ol className="grid grid-cols-2 gap-2 px-4 py-4 main-sm:grid-cols-5 main-sm:px-5">
			{SCHEDULE.map(({ date, time, label}) => (
				<li
					key={`${date}${time}`}
					className="flex items-stretch overflow-hidden rounded-xs bg-white/30 backdrop-blur-sm dark:bg-white/5"
				>
					<span aria-hidden className="w-1 shrink-0" />
					<span className="flex flex-col gap-1 px-2.5 py-2">
						<span className="text-xs leading-none text-(--ft-ink) opacity-75">{label}</span>
						<span className="text-sm leading-none font-semibold text-(--ft-primary) tabular-nums">
							{date}
							<span className="ml-1 font-normal opacity-70">{time}</span>
						</span>
					</span>
				</li>
			))}
		</ol>
	)
}

function Button({
	href,
	page,
	variant = 'outline',
	children,
}: {
	href?: string
	page?: string
	variant?: 'primary' | 'outline'
	children: React.ReactNode
}) {
	const boxClassName =
		variant === 'primary'
			? 'bg-(--ft-solid) text-white'
			: 'border border-(--ft-primary)/25 bg-(--ft-soft) text-(--ft-primary)'

	const box = (
		<span
			className={`inline-flex items-center rounded-max px-3.5 py-2 text-sm leading-none font-medium ${boxClassName}`}
		>
			{children}
		</span>
	)

	return page ? <Wiki.Link page={page}>{box}</Wiki.Link> : <Wiki.Link href={href!}>{box}</Wiki.Link>
}

function Footer() {
	return (
		<div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-(--ft-line) px-4 py-2.5 text-xs leading-relaxed main-sm:px-5">
			<span className="ml-auto text-(--ft-ink) opacity-45">插画 いよわ · ©DWANGO</span>
		</div>
	)
}
