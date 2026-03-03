import type { ReactNode } from 'react'

export interface WikitextInternalLinkProps {
	target: string
	children: ReactNode
}

export interface WikitextExternalLinkProps {
	href: string
	children: ReactNode
}

type WikitextLinkProps = WikitextInternalLinkProps | WikitextExternalLinkProps

export function WikitextLink(props: WikitextLinkProps) {
	if ('href' in props) {
		return (
			<>
				[{props.href} {props.children}]
			</>
		)
	}
	return (
		<>
			[[{props.target}|{props.children}]]
		</>
	)
}
