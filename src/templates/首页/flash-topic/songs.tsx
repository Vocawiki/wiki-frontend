import { WikiImageServerOnly } from '~/components/wiki-image/server'
import * as Wiki from '~/components/wikitext'

import { PARTICIPATION_CATEGORY_LINK, type TopicData, type TopicSong } from './data'

/** 曲目区 */
export function Songs({ data }: { data: TopicData }) {
	if (data.current.length === 0 && data.past.length === 0) return null

	return (
		<div className="flex flex-col gap-4 border-t border-(--ft-line) px-4 py-4 main-sm:px-5">
			<section className="flex flex-col gap-2.5">
				<Header
					badge="本届"
					title="无色透名祭4"
					note={currentNote(data)}
					muted={data.current.length === 0}
				/>
				{data.current.length > 0 && <SongList songs={data.current} />}
			</section>

			{data.past.length > 0 && (
				<section className="flex flex-col gap-2.5">
					<Header badge="往届" title="无色透名祭1–3" muted>
						<Wiki.Link page={PARTICIPATION_CATEGORY_LINK}>
							<span className="text-xs font-medium text-(--ft-primary)">全部作品→</span>
						</Wiki.Link>
					</Header>
					<SongList songs={data.past} />
				</section>
			)}
		</div>
	)
}

/** 本届的提示语 */
function currentNote({ current, currentTotal, currentTemplateExists }: TopicData): string {
	if (current.length > 0) return `已收录${currentTotal}首`
	if (!currentTemplateExists) return '本站尚未收录'
	return '条目待补充'
}

function Header({
	badge,
	title,
	note,
	muted,
	children,
}: {
	badge: string
	title: string
	note?: string
	muted?: boolean
	children?: React.ReactNode
}) {
	return (
		<div className="flex items-center gap-2">
			<span
				className={`rounded-max px-2 py-1 text-xs leading-none font-bold ${
					muted ? 'bg-(--ft-soft) text-(--ft-primary)' : 'bg-(--ft-primary) text-white'
				}`}
			>
				{badge}
			</span>
			<span className="text-sm leading-none font-semibold text-(--ft-ink)">{title}</span>
			{note && <span className="text-xs leading-none text-(--ft-ink) opacity-55">{note}</span>}
			{children && <span className="ml-auto">{children}</span>}
		</div>
	)
}

/** 窄屏横向滚动 */
const SCROLL_LIST = [
	'-mx-4 flex overflow-x-auto overscroll-x-contain px-4 pb-2',
	'main-sm:mx-0 main-sm:grid main-sm:overflow-visible main-sm:px-0 main-sm:pb-0',
	'[scrollbar-width:thin] [scrollbar-color:color-mix(in_oklab,var(--ft-primary)_25%,transparent)_transparent]',
	'[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
	'[&::-webkit-scrollbar-thumb]:rounded-max [&::-webkit-scrollbar-thumb]:bg-(--ft-primary)/25',
].join(' ')

/** 曲目卡片 */
function SongList({ songs }: { songs: TopicSong[] }) {
	return (
		<ul className={`${SCROLL_LIST} gap-2.5 main-sm:grid-cols-6`}>
			{songs.map((song) => (
				<li key={song.title} className="w-36 min-w-0 shrink-0 main-sm:w-auto">
					<Wiki.Link page={song.title}>
						<span className="flex flex-col gap-1.5">
							<span className="relative block aspect-video w-full overflow-hidden rounded-md bg-(--ft-soft)">
								{song.cover && (
									<WikiImageServerOnly
										file={song.cover}
										alt=""
										width={240}
										className="size-full object-cover"
									/>
								)}
							</span>
							<span className="line-clamp-2 text-xs leading-tight text-(--ft-ink)">
								{song.title}
							</span>
						</span>
					</Wiki.Link>
				</li>
			))}
		</ul>
	)
}
