import { assert } from 'radashi'
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
	assert(/^https?:\/\//.test(href), 'href必须以“http(s)://”开头')

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
	const link = page ?? children

	assert(
		!/^(?:Category|分[类類]|File|Image|文件|[档檔]案|[图圖][片像]):/i.test(link),
		`[[${link}]]不是一个有效的wikitext链接，是否忘记在开头加冒号？`,
	)

	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
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
