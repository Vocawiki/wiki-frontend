import type { ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export interface WikitextInternalLinkPropsSimple {
	page?: undefined
	children: string
}

export interface WikitextInternalLinkPropsComplex {
	page: string
	children: ReactNode
}

export type WikitextInternalLinkProps =
	| WikitextInternalLinkPropsSimple
	| WikitextInternalLinkPropsComplex

export interface WikitextExternalLinkProps {
	href: string
	children: ReactNode
}

export type WikitextLinkProps = WikitextInternalLinkProps | WikitextExternalLinkProps

export function WikitextLink(props: WikitextLinkProps) {
	if ('href' in props) {
		return <WikitextExternalLink {...props} />
	}
	return <WikitextInternalLink {...props} />
}

function WikitextExternalLink({ href, children }: WikitextExternalLinkProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		return (
			<a target="_blank" rel="noreferrer noopener" className="external text" href={href}>
				{children}
			</a>
		)
	}
	return (
		<>
			[{href} {children}]
		</>
	)
}

function WikitextInternalLink({ page, children }: WikitextInternalLinkProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		const link = page ?? children
		return (
			<a href={`/${link}`} title={link}>
				{children}
			</a>
		)
	}

	if (page === undefined) {
		return <>[[{children}]]</>
	}

	return (
		<>
			[[{page}|{children}]]
		</>
	)
}
