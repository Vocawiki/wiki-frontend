import { cn } from '@/lib/utils'

interface WikiInternalLinkTypeBoolMap {
	uncreated?: boolean
	redirect?: boolean
	disambiguation?: boolean
}
export type WikiInternalLinkType = keyof WikiInternalLinkTypeBoolMap
export interface WikiInternalUniquePropsProps extends WikiInternalLinkTypeBoolMap {
	title: string
	href: string
}
export type WikiInternalLinkProps = WikiInternalUniquePropsProps &
	Omit<React.ComponentProps<'a'>, 'title' | 'href'>

const typeToClassNameMap: Record<WikiInternalLinkType, string> = {
	uncreated: 'new',
	redirect: 'mw-redirect',
	disambiguation: 'mw-disambig',
}

export function WikiInternalLink({
	title,
	href,
	children,
	className: additionalClassName,
	uncreated,
	redirect,
	disambiguation,
	...props
}: WikiInternalLinkProps) {
	const className = cn(
		(Object.entries({ uncreated, redirect, disambiguation }) as [WikiInternalLinkType, boolean][])
			.filter(([, value]) => value)
			.map(([key]) => typeToClassNameMap[key]),
		additionalClassName,
	)

	return (
		<a href={href} title={title} className={className} {...props}>
			{children ?? title}
		</a>
	)
}
