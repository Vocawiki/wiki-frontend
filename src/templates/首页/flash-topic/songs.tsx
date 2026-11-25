import { cn } from 'cn'

import { formatNumber } from '@/lib/number'
import { WikiImageServerOnly } from '~/components/wiki-image/server'
import * as Wiki from '~/components/wikitext'

import { CURRENT_LIMIT, PARTICIPATION_CATEGORY_LINK, type TopicData, type TopicSong } from './data'

/** 曲目区 */
export function Songs({ data, className }: { data: TopicData; className?: string }) {
	if (data.current.length === 0 && data.past.length === 0) return null

	return (
		<div className={cn('space-y-4', className)}>
			{data.current.length > 0 && (
				<div className="flex flex-col gap-2.5">
					<Header badge="本届投稿" note={`已收录${formatNumber(data.currentTotal)}首`}>
						{data.currentTotal > CURRENT_LIMIT && (
							<Wiki.Functions.Link
								page="Template:无色透名祭4"
								className="text-xs font-medium text-(--ft-primary)"
							>
								更多作品 →
							</Wiki.Functions.Link>
						)}
					</Header>
					<SongList songs={data.current} />
				</div>
			)}

			{data.past.length > 0 && (
				<div className="flex flex-col gap-2.5">
					<Header badge="往届投稿" muted>
						<Wiki.Functions.Link
							page={PARTICIPATION_CATEGORY_LINK}
							className="text-xs font-medium text-(--ft-primary)"
						>
							更多作品 →
						</Wiki.Functions.Link>
					</Header>
					<SongList songs={data.past} />
				</div>
			)}
		</div>
	)
}

function Header({
	badge,
	note,
	muted,
	children,
}: {
	badge: string
	note?: string
	muted?: boolean
	children?: React.ReactNode
}) {
	return (
		<div className="flex items-center gap-2 pr-2">
			<span
				className={cn(
					'rounded-max px-2 py-1.5 text-sm leading-none font-semibold',
					muted ? 'bg-(--ft-soft) text-(--ft-primary)' : 'bg-(--ft-primary) text-(--ft-soft)',
				)}
			>
				{badge}
			</span>
			{note && <span className="text-xs leading-none text-(--ft-ink) opacity-80">{note}</span>}
			{children && <span className="ml-auto">{children}</span>}
		</div>
	)
}

/** 曲目卡片 */
function SongList({ songs }: { songs: TopicSong[] }) {
	return (
		<ul
			className={cn(
				'-mx-4 flex gap-2.5 overflow-x-auto overscroll-x-contain px-4 pb-2',
				'main-md:mx-0 main-md:grid main-md:grid-cols-6 main-md:overflow-visible main-md:px-0 main-md:pb-0',
				'scrollbar-thin [scrollbar-color:color-mix(in_oklab,var(--ft-primary)_25%,transparent)_transparent]',
				'[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
				'[&::-webkit-scrollbar-thumb]:rounded-max [&::-webkit-scrollbar-thumb]:bg-(--ft-primary)/25',
			)}
		>
			{songs.map((song) => (
				<li key={song.title} className="w-36 min-w-0 shrink-0 main-md:w-auto">
					<Wiki.Functions.Link page={song.title} className="flex flex-col gap-1.5">
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
						<span className="line-clamp-2 px-2 text-xs leading-tight text-(--ft-ink)">
							{song.title}
						</span>
					</Wiki.Functions.Link>
				</li>
			))}
		</ul>
	)
}
