import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'
import * as Wiki from '~/components/wikitext'

export function TopicPortal({
	image,
	imageFit = 'cover',
	imageBg,
	imageAlign = 'center',
	imageClip = {},
	children,
	withNavigation,
	className,
}: {
	image: string
	imageFit?: 'cover' | 'contain'
	imageBg?: string
	imageAlign?: 'center' | 'top'
	imageClip?: { top?: string; bottom?: string; left?: string; right?: string }
	children: string
	withNavigation?: boolean
	className?: string
}) {
	return (
		<div
			className={cn(
				'group/portal relative rounded-md dark:text-white',
				'[&>a]:absolute [&>a]:inset-0 [&>a]:block [&>a]:overflow-hidden [&>a]:rounded-md [&>a]:border [&>a]:border-gray-300 [&>a]:bg-white [&>a]:shadow-xs [&>a]:transition',
				'[&>a]:hover:border-slate-300 [&>a]:hover:shadow-md [&>a]:active:shadow-none',
				'dark:[&>a]:border-gray-600 dark:[&>a]:hover:border-white dark:[&>a]:hover:shadow-[0_0_4px_#fff,0_0_12px_#fff]',
				className,
			)}
			style={
				{
					'--h-button': 'calc(var(--text-xs) + 1rem)',
				} as CSSProperties
			}
		>
			<Wiki.Link page={children}>
				<div
					className={cn(
						'fill transition-transform select-none group-hover/portal:scale-125 [&_img]:size-full [&_span]:contents',
						{ cover: '[&_img]:object-cover', contain: '[&_img]:object-contain' }[imageFit],
						imageAlign === 'top' && '[&_img]:object-top',
					)}
					style={{ background: imageBg }}
				>
					{/* 图像裁剪。由于缩放中心不同，这个div不能和上层合并 */}
					<div
						className="fill"
						style={{
							top: imageClip.top ? `calc(-1 * ${imageClip.top})` : undefined,
							bottom: imageClip.bottom ? `calc(-1 * ${imageClip.bottom})` : undefined,
							left: imageClip.left ? `calc(-1 * ${imageClip.left})` : undefined,
							right: imageClip.right ? `calc(-1 * ${imageClip.right})` : undefined,
						}}
					>
						<Wiki.Image file={image} link={false} alt="" width={128} />
					</div>
				</div>
				{/* 颜色遮罩 */}
				<div
					className={cn(
						'fill bg-white/90 mask-t-from-50% mask-t-to-80% mask-size-[100%_200%] mask-top transition-all group-hover/portal:bg-white/80 group-hover/portal:mask-bottom dark:bg-gray-950/70 dark:group-hover/portal:bg-gray-950/60 [:hover>&]:bg-gray-100/70 [:hover>&]:backdrop-saturate-300 dark:[:hover>&]:bg-gray-800/60',
					)}
				/>
				{/* 模糊遮罩 */}
				<div className="fill transition [:hover>&]:backdrop-blur-sm" />
				<div className="visually-hidden select-none">查看条目：{children}</div>
			</Wiki.Link>

			<div className="pointer-events-none relative flex-center h-27 flex-col p-2">
				<div className="min-h-(--h-button) grow" />
				<div className="text-center transition not-dark:text-shadow-[0_0_4px_#fff,0_0_4px_#fff,0_0_8px_#fff,0_0_8px_#fff] group-hover/portal:[a:not(:hover)~*_&]:scale-90 group-hover/portal:[a:not(:hover)~*_&]:blur-[2px]">
					<div
						aria-hidden
						className="mr-[-1em] mb-1 text-xs leading-none tracking-[1em] opacity-0 transition-[letter-spacing,margin,opacity] duration-100 ease-in select-none group-hover/portal:mr-0 group-hover/portal:tracking-normal group-hover/portal:opacity-100 group-hover/portal:duration-[.25s,.25s,.15s] group-hover/portal:ease-out"
					>
						查看条目
					</div>
					<div
						aria-hidden
						className="text-center text-lg leading-none font-semibold transition-all"
					>
						{children}
					</div>
				</div>
				<div className="min-h-0.5 transition-[flex-grow] group-hover/portal:grow" />
				{withNavigation && (
					<LinkButtonInPortal page={`Template:${children}`} className="absolute top-2 right-2">
						导航
					</LinkButtonInPortal>
				)}
			</div>
		</div>
	)
}

export function TopicSeeMore({ page, children = '查看更多' }: { page: string; children?: string }) {
	return (
		<div
			className={cn(
				'contents text-center text-sm font-medium *:flex-center *:rounded-md *:border *:border-gray-300 *:bg-(--background-color-interactive) *:p-4 *:shadow-xs *:transition *:hover:border-slate-300 *:hover:shadow-md *:active:shadow-none',
				'dark:*:border-gray-600 dark:*:hover:border-white dark:*:hover:shadow-[0_0_4px_#fff,0_0_12px_#fff]',
			)}
		>
			<Wiki.Link page={page}>{children}</Wiki.Link>
		</div>
	)
}

function LinkButtonInPortal({
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
				'group/click-zone pointer-events-auto min-h-(--h-button) text-xs leading-none font-medium whitespace-nowrap *:block',
				className,
			)}
		>
			<Wiki.Link page={page}>
				<div
					className={cn(
						'rounded-full border px-2.75 py-1.75 backdrop-blur-sm transition-[padding]',
						'border-gray-300 bg-white/60 backdrop-filter-[contrast(.5)saturate(5)brightness(1.8)var(--tw-backdrop-blur)] group-hover/click-zone:shadow-lg group-hover/click-zone:backdrop-filter-[brightness(95%)saturate(15)var(--tw-backdrop-blur)] group-hover/portal:backdrop-filter-[saturate(2)var(--tw-backdrop-blur)] active:shadow-none not-dark:shadow-xs not-dark:text-shadow-[0_0_1px_#fff,0_0_2px_#fff] not-dark:group-hover/click-zone:bg-white/20',
						'dark:border-gray-400 dark:bg-gray-950/50 dark:backdrop-filter-[saturate(5)brightness(1.5)var(--tw-backdrop-blur)] dark:group-hover/click-zone:border-white dark:group-hover/click-zone:bg-transparent dark:group-hover/click-zone:shadow-[0_0_2px_#fff,0_0_8px_1px_#fff] dark:group-hover/click-zone:backdrop-filter-[saturate(5)brightness(1.5)var(--tw-backdrop-blur)]',
						// 大小调整
						'group-hover/click-zone:px-3.25! group-hover/click-zone:py-2.25! group-hover/portal:px-1.75 group-hover/portal:py-1.25',
					)}
				>
					{children}
				</div>
			</Wiki.Link>
		</div>
	)
}
