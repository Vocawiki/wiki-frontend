import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import * as Wiki from '~/components/wikitext'

import { TopicPortal, TopicSeeMore } from './portal'

/*
*[[模板:虚拟歌手衍生角色|虚拟歌手衍生角色]]
|标题3=[[P主]]及相关人物
|栏目3=*[[模板:P主|P主列表]]
*[[P名说出来]]
*[[镜音P名说出来]]
*[[TalkoidP名说出来]]
*[[新人P名说出来!2011]]

*[[:分类:P主模板|P主模板]]
*[[模板:Hobo日P]]<!--“第四天坑”、“秋园女装计划”×-->

*[[:分类:画师|画师]]
*[[虚拟歌手音源提供者列表|声音提供者]]

|标题4=[[Special:RandomInCategory/使用VOCALOID的歌曲|歌曲]]
|栏目4=*[[:分类:使用VOCALOID的歌曲|使用VOCALOID的歌曲]]
*[[:分类:音乐专辑|音乐专辑]]
*[[:分类:音声合成作品系列曲|音声合成作品系列曲]]

*[[:分类:排行|排行]]
*[[模板:虚拟歌手歌曲成就|虚拟歌手歌曲成就]]

|标题5=[[VOCARAN]]
|栏目5=*[[周刊VOCAL Character & UTAU排行榜#all|周刊全列表]]

*[[模板:月刊VOCALOID TOP30|月刊VOCALOID TOP30]]

*[[NICONICO VOCALOID SONGS TOP20]]
*[[模板:NICONICO_VOCALOID_SONGS_TOP20|周榜全列表]]

*[[年刊VOCALOID·UTAU分区新曲排行榜]]

*[[虚拟歌手外语排行榜]]
*[[模板:虚拟歌手外语排行榜列表|全列表]]

*[[Biliboard术力口周榜]]
*[[模板:Biliboard术力口周榜榜单|全列表]]
}}
 */
export function Topics() {
	return (
		<>
			<h2 className="visually-hidden">专题推荐</h2>
			<div className="space-y-8">
				<Section>
					<SectionHeader>音声合成软件</SectionHeader>
					<TopicPortal image="VOCALOID.gif" withNavigation>
						VOCALOID
					</TopicPortal>
					<TopicPortal image="Utau-screen.png" withNavigation>
						UTAU
					</TopicPortal>
					<TopicPortal image="CeVIO.jpg" imageFit="contain" imageBg="#fff" withNavigation>
						CeVIO
					</TopicPortal>
					<TopicPortal image="Voiceroid.svg" imageFit="contain">
						VOICEROID
					</TopicPortal>
					<TopicPortal image="Synthesizer_V_R2_logo.svg" imageFit="contain" withNavigation>
						Synthesizer V
					</TopicPortal>
					<TopicPortal image="Neutrino-icon.png" imageFit="contain" withNavigation>
						NEUTRINO
					</TopicPortal>
					<TopicPortal image="ACE_Studio.jpg" imageFit="contain" imageBg="#1a1e27" withNavigation>
						ACE Studio
					</TopicPortal>
					<TopicPortal image="AIVOICE.png" imageFit="contain" imageBg="#fff" withNavigation>
						A.I.VOICE
					</TopicPortal>
					<TopicPortal image="Mikunt_logo.png" imageFit="contain">
						New Type
					</TopicPortal>
					<TopicSeeMore page="Template:音声合成软件" />
				</Section>
				<Section>
					<SectionHeader button={{ page: '虚拟歌手', children: '查看条目' }}>
						虚拟歌手
					</SectionHeader>
					<TopicPortal
						image="MikuNewType_main.png"
						imageAlign="top"
						imageClip={{ top: '6px', left: '50px', right: '50px' }}
						withNavigation
					>
						初音未来
					</TopicPortal>
					<TopicPortal image="Teto_SV.png" imageAlign="top" withNavigation>
						重音Teto
					</TopicPortal>
					<TopicPortal image="GUMI.png" imageAlign="top">
						GUMI
					</TopicPortal>
					<TopicPortal
						image="RinLen_v4x.png"
						imageAlign="top"
						imageClip={{ top: '42px', left: '70px', right: '70px' }}
					>
						镜音铃·连
					</TopicPortal>
					<TopicPortal
						image="Ch_img_kaitov3.png"
						imageAlign="top"
						imageClip={{ left: '20px', right: '130px' }}
					>
						KAITO
					</TopicPortal>
					<TopicPortal
						image="Yuki_v4.jpg"
						imageAlign="top"
						imageClip={{ right: '40px', top: '8px' }}
						withNavigation
					>
						歌爱雪
					</TopicPortal>
					<TopicPortal
						image="可不CeVIO立绘.png"
						imageAlign="top"
						imageClip={{ top: '-5px', left: '0px', right: '-20px' }}
						withNavigation
					>
						可不
					</TopicPortal>
					<TopicPortal
						image="足立レイ2.png"
						imageAlign="top"
						imageClip={{ top: '20px', left: '70px', right: '80px' }}
					>
						足立零
					</TopicPortal>
					<TopicPortal
						image="V4_color.png"
						imageAlign="top"
						imageClip={{ top: '12px' }}
						withNavigation
					>
						flower
					</TopicPortal>
					<TopicPortal
						image="俊达萌003.png"
						imageAlign="top"
						imageClip={{ top: '60px', left: '25px', right: '40px' }}
						withNavigation
					>
						俊达萌
					</TopicPortal>
					<TopicPortal
						image="VOCALOID_IA01.png"
						imageAlign="top"
						imageClip={{ left: '40px', right: '24px' }}
						withNavigation
					>
						IA
					</TopicPortal>
					<div className="grid gap-2">
						<TopicSeeMore page="Category:按音声合成软件分类的角色">查看更多</TopicSeeMore>
						<TopicSeeMore page="Template:虚拟歌手衍生角色">衍生角色</TopicSeeMore>
					</div>
				</Section>
			</div>
		</>
	)
}
/*


*/
function Section({ children }: { children: ReactNode }) {
	return (
		<div className="grid auto-rows-fr grid-cols-2 gap-2 main-2xs:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))]">
			{children}
		</div>
	)
}

function SectionHeader({
	children,
	button = { page: `Template:${children}`, children: '查看全部' },
}: {
	children: string
	button?: { page: string; children: ReactNode }
}) {
	return (
		<div
			className={cn(
				'col-span-2 flex-center flex-col gap-2 overflow-hidden rounded-lg border border-gray-300 bg-(--background-color-progressive-subtle) shadow-xs dark:border-gray-600',
			)}
		>
			<h3 className="text-xl leading-none font-semibold before:text-(--color-progressive) before:content-['#'] not-dark:text-shadow-[0_0_4px_#fff,0_0_8px_#fff]">
				{children}
			</h3>
			<SeeAllButton page={button.page} className="*:-mb-2.5">
				{button.children}
			</SeeAllButton>
		</div>
	)
}

function SeeAllButton({
	page,
	children,
	className,
}: {
	page: string
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={cn(
				'contents text-sm leading-none font-medium whitespace-nowrap *:block *:rounded-max *:border *:border-gray-300 *:bg-white/80 *:px-3.25 *:py-2.25 *:shadow-xs *:auto-interact-fx *:active:shadow-none dark:*:border-gray-400 dark:*:bg-gray-950/50',
				className,
			)}
		>
			<Wiki.Link page={page}>{children}</Wiki.Link>
		</div>
	)
}
