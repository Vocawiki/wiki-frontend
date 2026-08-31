import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { WikiImageServerOnly } from '@/src/components/wiki-image/server'
import * as Wiki from '~/components/wikitext'

export function Contents() {
	return (
		<div className="min-w-0 overflow-hidden rounded-container border border-[#e4e4e7] bg-white/85 shadow backdrop-brightness-200 backdrop-saturate-150">
			<div className="h-full overflow-x-auto mask-[linear-gradient(90deg,transparent,black_8px,black_calc(100%-8px),transparent)] p-2.25">
				<div className="flex w-max gap-2">
					<Section title="TOP100排行" titleClassName="bg-[#f1ad29]" className="[&_a]:bg-[#fef7ea]">
						<Top1Video
							originalTitle="音楽はつづく"
							translatedTitle="音乐还会继续"
							author="OSTER project"
							image="音乐还会继续.jpg"
						/>
						<TopVideo rank={2} originalTitle="恋" translatedTitle="恋" author="Sohbana" />
						<TopVideo
							rank={3}
							originalTitle="オムライス作りたいな"
							translatedTitle="想做蛋包饭啊"
							author="GYARI（ココアシガレットP）"
						/>
					</Section>
					<Section title="ROOKIE排行" titleClassName="bg-[#288bd2]" className="[&_a]:bg-[#eaf3fb]">
						<Top1Video
							originalTitle="あなたの記憶"
							translatedTitle="你的记忆"
							author="ドアのノブ"
							image="あなたの記憶.jpg"
						/>
						<TopVideo
							rank={2}
							originalTitle="ミューテーション"
							translatedTitle="Mutation"
							author="もくろ"
						/>
						<TopVideo rank={3} originalTitle="Kommune" translatedTitle="Kommune" author="吉田楓" />
					</Section>
					<Section title="REMIX排行" titleClassName="bg-[#349d4b]" className="[&_a]:bg-[#ebf5ed]">
						<Top1Video
							originalTitle="デロスサントス - namigroove remix -"
							translatedTitle="德罗斯桑托斯/Namigroove"
							author="なみぐる"
							image="デロスサントス - namigroove remix -.jpg"
						/>
						<TopVideo
							rank={2}
							originalTitle="ラビットホールをエロい目で見るな"
							translatedTitle="不要用涩涩的眼光看待兔子洞啊"
							author="すとろー"
						/>
						<TopVideo
							rank={3}
							originalTitle="メズマライザルーム"
							translatedTitle="催眠者之室"
							author="Theas"
						/>
					</Section>
					<News />
				</div>
			</div>
		</div>
	)
}

function News() {
	return (
		<>
			<Section
				title={
					<>
						资讯 <span className="font-normal">| 术力口百科姬</span>
					</>
				}
				titleClassName="bg-(--primary)"
			>
				<li className="contents *:relative *:flex *:grow *:flex-col *:overflow-hidden *:rounded-md *:bg-[#eae6ff] *:shadow">
					<Wiki.Link href="https://www.bilibili.com/video/BV1Ex4X6nERS">
						<WikiImageServerOnly
							file="VCCL2026夏：除名退赛歌曲排行榜.jpg"
							width={192}
							height={108}
						/>
						<div className="absolute top-1 right-1 rounded-full bg-white/80 px-2 py-1 text-xs leading-none font-medium">
							视频
						</div>
						<div className="flex grow flex-col gap-2 px-2 pt-2">
							<div className="-my-px text-justify leading-[calc(1em+2px)] font-semibold">
								这些术曲都犯规了？VCCL 2026夏：除名/退赛歌曲排行榜
							</div>
							<div className="relative grow overflow-hidden mask-b-from-50%">
								<p className="absolute inset-x-0 top-0 -my-px text-justify text-xs leading-[calc(1em+2px)]">
									活动期间，多首参赛歌曲因MV出现3DS、Switch、面包超人或混入大量外部素材等理由被移出榜单，也有P主自行退出。本视频将这些歌曲按投稿部门整理成榜，各部分内按统计时点的播放量从低到高排列……
								</p>
							</div>
						</div>
					</Wiki.Link>
				</li>
			</Section>
			<Section
				title={
					<>
						资讯 <span className="font-normal">| 术力口百科姬</span>
					</>
				}
				titleClassName="bg-(--primary)"
			>
				<li className="contents *:relative *:flex *:grow *:flex-col *:overflow-hidden *:rounded-md *:bg-[#eae6ff] *:shadow">
					<Wiki.Link href="https://www.bilibili.com/opus/1240497721756876835">
						<WikiImageServerOnly file="VCCL2026夏风波.png" width={192} height={108} />
						<div className="absolute top-1 right-1 rounded-full bg-white/80 px-2 py-1 text-xs leading-none font-medium">
							图文
						</div>
						<div className="flex grow flex-col gap-2 px-2 pt-2">
							<div className="-my-px text-justify leading-[calc(1em+2px)] font-semibold">
								<span lang="ja">ボカコレ</span>2026夏风波：一首歌因为在MV出现了3DS，被移出排行榜
							</div>
							<div className="relative grow overflow-hidden mask-b-from-50%">
								<p className="absolute inset-x-0 top-0 -my-px text-justify text-xs leading-[calc(1em+2px)]">
									P主 奏-Kanade- 向TOP100组投稿了《<span lang="ja">ツァイトガイスト</span>
									》（时代精神），此曲反响不错，多次冲进小时榜前20。8月22日，奏发现自己这首歌被移出了排行榜，并且他事先未收到任何通知……
								</p>
							</div>
						</div>
					</Wiki.Link>
				</li>
			</Section>
		</>
	)
}

function Section({
	title,
	titleClassName,
	className,
	children,
}: {
	title: ReactNode
	titleClassName: string
	className?: string
	children: ReactNode
}) {
	return (
		<div className={cn('flex flex-col', className)}>
			<div
				className={cn(
					'mb-2 rounded-md p-1 text-center text-base leading-none font-semibold text-white',
					titleClassName,
				)}
			>
				{title}
			</div>
			<ul className="flex w-48 grow flex-col gap-2 text-sm leading-none">{children}</ul>
		</div>
	)
}

function Top1Video({
	originalTitle,
	translatedTitle,
	author,
	image,
	className,
}: {
	originalTitle: string
	translatedTitle: string
	author: string
	image: string
	className?: string
}) {
	return (
		<li className={cn('*:block *:overflow-hidden *:rounded-md *:shadow', className)}>
			<Wiki.Link page={translatedTitle}>
				<WikiImageServerOnly file={image} width={192} height={108} />
				<div className="flex items-center gap-2 p-2">
					<div
						className="flex-center size-7 shrink-0 rounded-full text-xl leading-none font-bold"
						style={{ backgroundColor: '#f9cf20' }}
					>
						1
					</div>
					<div lang="ja">
						<div className="line-clamp-1 font-semibold">
							<Wiki.NoConversion>{originalTitle}</Wiki.NoConversion>
						</div>
						<div className="mt-0.5 line-clamp-1 text-xs leading-none">
							<Wiki.NoConversion>{author}</Wiki.NoConversion>
						</div>
					</div>
				</div>
			</Wiki.Link>
		</li>
	)
}
function TopVideo({
	rank,
	originalTitle,
	translatedTitle,
	author,
	className,
}: {
	rank: 2 | 3
	originalTitle: string
	translatedTitle: string
	author: string
	className?: string
}) {
	return (
		<li className={cn('*:block *:overflow-hidden *:rounded-md *:shadow', className)}>
			<Wiki.Link page={translatedTitle}>
				<div className="flex items-center gap-2 p-2">
					<div
						className="flex-center size-7 shrink-0 rounded-full text-xl leading-none font-bold"
						style={{ backgroundColor: rank === 2 ? '#ccc' : '#dda95e' }}
					>
						{rank}
					</div>
					<div lang="ja">
						<div className="line-clamp-1 font-semibold">
							<Wiki.NoConversion>{originalTitle}</Wiki.NoConversion>
						</div>
						<div className="mt-0.5 line-clamp-1 text-xs leading-none">
							<Wiki.NoConversion>{author}</Wiki.NoConversion>
						</div>
					</div>
				</div>
			</Wiki.Link>
		</li>
	)
}
