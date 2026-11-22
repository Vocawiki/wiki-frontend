import type { CSSProperties } from 'react'

import { WikiImageServerOnly } from '~/components/wiki-image/server'
import { LangSpan } from '~/components/wiki-templates/lang'
import * as Wiki from '~/components/wikitext'

import {
	loadTopicData,
	MAIN_ARTICLE,
	PARTICIPATION_TAG_URL,
	RANDOM_PLAY_URL,
	SUBMITTED_COUNT,
} from './data'
import { Songs } from './songs'

/** logo */
const LOGO = '无色透名祭4LOGO.svg'
/** 背景 */
const KEY_VISUAL = 'bg-[url(/images/4/4d/%E6%97%A0%E8%89%B2%E9%80%8F%E5%90%8D%E7%A5%AD4KV.png)]'

/** 专题配色 */
const THEME = {
	'--ft-ink': '#173f49',
	'--ft-primary': '#0e4d5f',
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
				{/* 背景 */}
				<div
					aria-hidden
					className={`absolute inset-0 bg-cover bg-center dark:opacity-25 not-dark:mix-blend-multiply ${KEY_VISUAL}`}
				/>

				{/* 栏目名 */}
				<span className="absolute top-3.5 right-4 flex items-center gap-2 text-base leading-none font-bold tracking-[0.2em] text-(--ft-primary) main-sm:top-4 main-sm:right-5 main-sm:text-lg">
					<span aria-hidden className="h-4 w-0.75 rounded-max bg-(--ft-accent)" />
					专题
				</span>

				<div className="relative">
					{/* 留白 */}
					<div aria-hidden className="h-32 main-sm:h-40" />

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
						<div className="relative bg-linear-to-b from-white/25 via-white/85 via-50% to-white dark:from-[#0c171a]/25 dark:via-[#0c171a]/85 dark:to-[#0c171a]">
							<div className="px-4 pt-5 pb-4 main-sm:px-5">
								<div className="flex flex-col gap-3 main-sm:flex-row main-sm:items-end">
									<p className="flex flex-col gap-1.5">
										<LangSpan lang="ja">
											<span className="text-base leading-none font-semibold tracking-wide text-(--ft-primary)">
												全員、透名
											</span>
										</LangSpan>
										<span className="text-sm leading-relaxed text-(--ft-ink) opacity-70">
											第四届术力口匿名投稿活动“无色透名祭4”，共
											{SUBMITTED_COUNT.toLocaleString('en-US')}首参赛曲。
										</span>
									</p>

									<div className="flex flex-wrap gap-2 main-sm:ml-auto">
										<Button href={RANDOM_PLAY_URL} variant="primary">
											随机听一首
										</Button>
										<Button href={PARTICIPATION_TAG_URL}>全部参赛曲</Button>
									</div>
								</div>
							</div>

							<Songs data={data} />
							<Footer />
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

function Button({
	href,
	variant = 'outline',
	children,
}: {
	href: string
	variant?: 'primary' | 'outline'
	children: string
}) {
	const boxClassName =
		variant === 'primary'
			? 'bg-(--ft-primary) text-white'
			: 'border border-(--ft-primary)/40 text-(--ft-primary)'

	return (
		<Wiki.Link href={href}>
			<span
				className={`inline-flex items-center rounded-max px-3.5 py-2 text-sm leading-none font-medium ${boxClassName}`}
			>
				{children}
			</span>
		</Wiki.Link>
	)
}

function Footer() {
	return (
		<div className="flex flex-wrap items-center gap-x-3 gap-y-1 px-1 py-2.5 text-xs leading-none main-sm:px-5">
			<span className="ml-auto text-(--ft-ink) opacity-45">插画©いよわ</span>
		</div>
	)
}
