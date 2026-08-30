import { ScrollArea, type ScrollAreaViewportProps } from '@base-ui/react/scroll-area'
import type { ReactNode } from 'react'

export function HorizontalScrollArea({
	children,
	className,
	viewport = {},
}: {
	children: ReactNode
	className?: string
	viewport?: ScrollAreaViewportProps
}) {
	return (
		<ScrollArea.Root className={className}>
			<ScrollArea.Viewport {...viewport}>
				<ScrollArea.Content>{children}</ScrollArea.Content>
			</ScrollArea.Viewport>
			<ScrollArea.Scrollbar
				className="pointer-events-none relative flex h-5 items-center rounded-max bg-transparent transition-colors data-hovering:pointer-events-auto data-hovering:bg-(--background-color-neutral-subtle) data-scrolling:pointer-events-auto data-scrolling:bg-(--background-color-neutral-subtle)"
				orientation="horizontal"
			>
				<ScrollArea.Thumb className="group/thumb pointer-events-auto relative h-full w-full [--inset:7px] hover:[--inset:4px] active:[--inset:6px] active:*:ease-out">
					<div className="absolute inset-(--inset) rounded-max bg-(--background-color-progressive)/15 transition-[inset] group-active/thumb:-inset-1 group-active/thumb:duration-100" />
					<div className="absolute inset-(--inset) rounded-max bg-(--background-color-progressive) opacity-80 transition-[opacity,inset,box-shadow] group-hover/thumb:opacity-100 group-active/thumb:opacity-100 group-active/thumb:duration-75" />
				</ScrollArea.Thumb>
			</ScrollArea.Scrollbar>
		</ScrollArea.Root>
	)
}
