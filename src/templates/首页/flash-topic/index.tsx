import type { CSSProperties, ReactNode } from 'react'

import * as Wiki from '~/components/wikitext'

import { Contents } from './contents'

export function FlashTopic() {
	const copyright = '插画 © DWANGO Co., Ltd.'

	return (
		<div
			className="preflight relative flow-root"
			style={{ '--primary': '#6049d4', '--secondary': '#473dc1' } as CSSProperties}
		>
			<div className="fill ignore-article-inline-padding bg-[#a3aed4] [clip-path:inset(0)]">
				<div className="fixed inset-x-0 top-0 h-screen bg-[url(/images/5/57/The_VOCALOID_Collection_2026_Summer_KV.webp)] bg-cover bg-center contrast-80" />
			</div>
			<div className="relative my-4 flex flex-col">
				<Title />

				<div className="mt-4 grid grow gap-2 text-[#252525] main-md:grid-cols-[20rem_auto] [&_a]:auto-interact-fx">
					<Information />
					<Contents />
				</div>

				<div className="relative mt-1 text-right">
					<div
						aria-hidden
						className="absolute right-0 text-xs text-[#161616] opacity-50 select-none"
						style={{ WebkitTextStrokeWidth: '2px' }}
					>
						{copyright}
					</div>
					<small className="relative text-xs text-white">{copyright}</small>
				</div>
			</div>
		</div>
	)
}

function Title() {
	return (
		<div className="relative text-[1.75rem] leading-[calc(1em+2px)] font-black text-white main-sm:text-[2rem] main-md:text-[2.25rem] main-lg:text-[2.5rem]">
			<div
				aria-hidden
				className="absolute top-11 left-px text-white blur-[2px] select-none"
				style={{ WebkitTextStrokeWidth: '0.35em' }}
			>
				<TitleContent />
			</div>
			<div
				aria-hidden
				className="absolute top-11 left-px text-[#161616] select-none"
				style={{ WebkitTextStrokeWidth: '0.15em' }}
			>
				<TitleContent />
			</div>
			<h2 className="relative">
				<div
					className="mb-2 h-9 w-16 rounded-[3px] border-2 bg-white p-0.5 text-[1.25rem] leading-none font-bold text-(--secondary)"
					style={{ boxShadow: '0 0 4px 2px #fff' }}
				>
					<div className="flex-center size-full rounded-[2px] border-2 border-[#f5efff]">专题</div>
				</div>
				<div className="ml-px">
					<TitleContent subColor="#e6ff55" />
				</div>
			</h2>
		</div>
	)
}

function TitleContent({ subColor }: { subColor?: string }) {
	return (
		<>
			<span className="inline-block">The VOCALOID Collection</span>{' '}
			<span className="inline-block" style={subColor ? { color: subColor } : undefined}>
				2026 Summer
			</span>
		</>
	)
}

function Information() {
	return (
		<div className="flex flex-col gap-2">
			<div className="space-y-1 rounded-container border border-[#e4e4e7] bg-white/85 py-2 text-sm leading-tight font-medium shadow backdrop-brightness-200 backdrop-saturate-150 [&_a]:ml-3 [&_a]:block [&_a]:font-semibold [&_a]:text-(--primary)">
				<Wiki.Link page="The VOCALOID Collection">
					The VOCALOID Collection（<span lang="ja">ボカコレ</span>）
				</Wiki.Link>
				<div className="mr-3 ml-2.25 flex gap-1">
					<div className="w-1 rounded-max bg-[#eae6ff]" />
					<p className="text-justify font-normal">
						由DWANGO举办的线上VOCALOID歌曲投稿节，每年两届。国内粉丝将其简称为VCCL。
					</p>
				</div>
			</div>
			<div className="space-y-2 rounded-container border border-[#e4e4e7] bg-white/85 p-2.25 shadow backdrop-brightness-200 backdrop-saturate-150">
				<div className="flex items-center gap-2 rounded-md bg-[#eae6ff] py-2 pr-4">
					<div className="grow space-y-1 text-center font-bold">
						<div className="text-sm leading-none font-medium">本届</div>
						<div className="text-xl leading-none text-(--primary)">2026夏</div>
					</div>
					<div className="grid border-separate grid-cols-[auto_auto] items-center gap-x-2 gap-y-1 font-medium">
						<div className="text-sm leading-none">开始</div>
						<div>8月20日</div>
						<div className="text-sm leading-none">结束</div>
						<div>8月24日</div>
					</div>
				</div>
				<div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-2 text-center text-sm leading-none font-medium">
					<div className="border-t border-[#e4e4e7]" />
					投稿数量
					<div className="border-t border-[#e4e4e7]" />
				</div>
				<div className="grid grid-cols-3 justify-between gap-4">
					<SubmitNumber category="TOP100" value={2368} bg="#f1ad29" />
					<SubmitNumber category="ROOKIE" value={3270} bg="#288bd2" />
					<SubmitNumber category="REMIX" value={671} bg="#349d4b" />
				</div>
			</div>
			<ul className="[&_a]:ring- grid grid-cols-2 gap-x-1 gap-y-2 text-center text-sm font-medium text-white *:*:flex-center *:contents *:*:rounded-max *:*:p-3 *:*:leading-none [&_a]:border [&_a]:border-[#e4e4e7] [&_a]:shadow">
				<li className="*:col-span-2 *:bg-(--primary)">
					<Wiki.Link page="The VOCALOID Collection">完整介绍</Wiki.Link>
				</li>
				<li className="*:bg-[#252525]">
					<Wiki.Link page="Template:The VOCALOID Collection2026夏">
						<span>
							Vocawiki
							<span className="whitespace-nowrap">上的</span>
							<span className="whitespace-nowrap">曲目</span>
						</span>
					</Wiki.Link>
				</li>
				<li className="*:bg-[#252525]!">
					<Wiki.Link href="https://vocaloid-collection.jp/">活动官网</Wiki.Link>
				</li>
			</ul>
		</div>
	)
}

function SubmitNumber({ category, value, bg }: { category: ReactNode; value: number; bg: string }) {
	return (
		<div className="text-center">
			<div
				className="rounded-full p-1 text-sm leading-none font-medium text-white"
				style={{ backgroundColor: bg }}
			>
				{category}
			</div>
			<div className="mt-0.5 text-xl leading-none font-bold">{value}</div>
		</div>
	)
}
