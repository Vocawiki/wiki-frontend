import type { CSSProperties, ReactNode } from 'react'

import * as Wiki from '~/components/wikitext'
import { cn } from '~/lib/utils'

export function ExternalSites() {
	return (
		<div
			className={cn(
				'plainlinks preflight flex flex-col gap-8',
				'main-lg:flex-row main-lg:justify-between main-xl:gap-12',
				'[&_.mw-heading]:contents',
				// 链接交互动画
				'[&_a]:transition-[filter] [&_a]:duration-200 [&_a:active]:brightness-92 [&_a:active]:saturate-106 [&_a:active]:transition-none [&_a:hover]:brightness-96 [&_a:hover]:saturate-103',
			)}
		>
			<Section title="友情链接" className="main-lg:grow">
				<div
					className={cn(
						'flex-center',
						'main-lg:grow main-lg:rounded-container main-lg:border main-lg:border-(--border-color-subtle) main-lg:bg-(--background-color-neutral-subtle) main-lg:p-2',
					)}
				>
					<div className="*:flex *:items-center *:gap-2 *:rounded-md! *:border *:border-[#fbd68a] *:bg-[#fffbec]! *:p-1.75! *:pr-2.25! *:leading-none *:text-[#ae420a]! *:[box-shadow:0_1px_3px_rgba(131,100,0,.1),0_1px_2px_-1px_rgba(131,100,0,.1)]">
						<Wiki.Link href="https://vcpedia.cn/%E9%A6%96%E9%A1%B5">
							<Wiki.Image
								file="VCPedia logo.png"
								width={36}
								height={36}
								link={false}
								alt=""
								className="flex-center size-10"
							/>
							<div>
								<div className="font-medium">VCPedia</div>
								<div className="mt-1 text-xs">关于中文歌声合成的一切</div>
							</div>
						</Wiki.Link>
					</div>
				</div>
			</Section>

			<div className="w-px bg-(--border-color-divider) not-main-lg:hidden" />

			<Section title="其他相关站点">
				<ul
					className={cn(
						'm-0! grid auto-rows-[1fr] grid-cols-[repeat(auto-fill,minmax(calc(3rem+11em),1fr))] justify-center gap-2',
						'main-md:mx-auto! main-md:max-w-max main-md:grid-cols-3',
					)}
					role="list"
				>
					<SiteItem
						href="https://w.atwiki.jp/vocaloidchly/"
						icon="@WIKI logo.svg"
						bg="#fbebd5"
						fg="#b05d00"
					>
						{'-{vocaloid中文歌詞wiki}-'}
					</SiteItem>
					<SiteItem
						href="https://utauchn.huijiwiki.com/wiki/%E9%A6%96%E9%A1%B5"
						icon="UTAU中华组wiki avatar.png"
						bg="#e8e8e9"
						fg="#525153"
					>
						{'-{UTAU中华组wiki}-'}
					</SiteItem>
					<SiteItem
						href="https://w.atwiki.jp/hmiku/"
						icon="@WIKI logo.svg"
						bg="#fbebd5"
						fg="#b05d00"
					>
						{'{{lj|初音ミク Wiki}}'}
					</SiteItem>
					<SiteItem
						href="https://vocaloid.fandom.com/wiki/Vocaloid_Wiki"
						icon="VOCALOID Wiki icon.png"
						withPixelatedIcon
						withRoundedIcon
						bg="#e0e9f3"
						fg="#285d8e"
					>
						VOCALOID Wiki
					</SiteItem>
					<SiteItem
						href="https://vocaloidlyrics.miraheze.org/wiki/Vocaloid_Lyrics_Wiki"
						icon="Vocaloid Lyrics Wiki avatar.png"
						withRoundedIcon
						bg="#d7ede7"
						fg="#006a4d"
					>
						Vocaloid Lyrics Wiki
					</SiteItem>
					<SiteItem
						href="https://vocadb.net/"
						icon="VocaDB avatar.png"
						withPixelatedIcon
						bg="#d7ecf4"
						fg="#1f647e"
					>
						<span>
							VocaDB <span className="inline-block text-xs font-normal">(Vocaloid Database)</span>
						</span>
					</SiteItem>
				</ul>
			</Section>
		</div>
	)
}

function Section({
	title,
	children,
	className,
}: {
	title: ReactNode
	children: ReactNode
	className?: string
}) {
	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<h2 className="grow-0 text-center text-sm leading-none font-medium text-(--color-subtle) main-lg:ml-1 main-lg:text-left">
				{title}
			</h2>
			{children}
		</div>
	)
}

function SiteItem({
	href,
	icon,
	withPixelatedIcon,
	withRoundedIcon,
	children,
	bg,
	fg,
}: {
	href: string
	icon: string
	withPixelatedIcon?: boolean
	withRoundedIcon?: boolean
	children: ReactNode
	bg: string
	fg: string
}) {
	return (
		<li
			className={cn(
				'contents leading-none font-medium *:flex *:items-center *:gap-2 *:rounded-md! *:bg-(--bg)! *:p-2! *:text-(--fg)!',
				withRoundedIcon && '[&_img]:rounded-(--border-radius-base)',
			)}
			style={
				{
					'--bg': bg,
					'--fg': fg,
				} as CSSProperties
			}
		>
			<Wiki.Link href={href}>
				<Wiki.Image
					file={icon}
					width={24}
					link={false}
					alt=""
					className={cn('shrink-0', withPixelatedIcon && 'image-pixelated')}
				/>
				{children}
			</Wiki.Link>
		</li>
	)
}
