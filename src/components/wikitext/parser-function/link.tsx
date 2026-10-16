import { assert } from 'radashi'
import type { ComponentProps, ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'
import { cssPropertiesToString } from '@/lib/react'
import type { ObjectEntries } from '@/lib/typing'
import { normalizeWikiTitle } from '@/lib/wiki'
import { WikiExternalLink, WikiInternalLink } from '~/components/wiki-link'

type AllowedAttributes =
	| 'id'
	| 'className'
	| 'style'
	| 'lang'
	| 'dir'
	| 'title'
	| 'tabIndex'
	| 'aria-describedby'
	| 'aria-flowto'
	| 'aria-hidden'
	| 'aria-label'
	| 'aria-labelledby'
	| 'aria-level'
	| 'aria-owns'
	| 'role'
	| 'about'
	| 'property'
	| 'resource'
	| 'datatype'
	| 'typeof'
	| 'itemID'
	| 'itemProp'
	| 'itemRef'
	| 'itemScope'
	| 'itemType'

type AllowedProps = Pick<ComponentProps<'a'>, AllowedAttributes>

export type ParserFunctionLinkProps = {
	page: string
	children: ReactNode
} & AllowedProps

export function ParserFunctionLink({ page, title, children, ...props }: ParserFunctionLinkProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		return (
			<WikiInternalLink href={`/${page}`} title={title ?? normalizeWikiTitle(page)} {...props}>
				{children}
			</WikiInternalLink>
		)
	}

	return (
		<>
			{'{{#link:'}
			{page}|{children}
			{propsToWikitext(props)}
			{'}}'}
		</>
	)
}
export type ParserFunctionExternalLinkProps = {
	href: string
	children: ReactNode
} & AllowedProps

export function ParserFunctionExternalLink({
	href,
	children,
	...props
}: ParserFunctionExternalLinkProps) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		return (
			<WikiExternalLink href={href} {...props}>
				{children}
			</WikiExternalLink>
		)
	}

	return (
		<>
			{'{{#externallink:'}
			{href}|{children}
			{propsToWikitext(props)}
			{'}}'}
		</>
	)
}

export type ParserFunctionPlainLinkProps = {
	href: string
	children: ReactNode
} & AllowedProps

export function ParserFunctionPlainLink({
	href,
	children,
	...props
}: ParserFunctionPlainLinkProps) {
	assert(/^\/(?!\/)/u.test(href.replaceAll('\\', '/')), 'href必须以“/”开头')

	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		)
	}

	return (
		<>
			{'{{#plainlink:'}
			{href}|{children}
			{propsToWikitext(props)}
			{'}}'}
		</>
	)
}

function propsToWikitext(props: AllowedProps): string {
	return (Object.entries(props) as ObjectEntries<AllowedProps>)
		.filter((x) => x[1] !== undefined && x[1] !== false)
		.map(([name, value]): [string, string] => {
			switch (name) {
				case 'className':
					return ['class', value!]
				case 'style':
					return ['style', cssPropertiesToString(value!)]
				default:
					return [name, String(value)]
			}
		})
		.map(([name, value]) => {
			if (value.includes('|')) {
				throw new Error(`为了避免潜在问题，属性${name}的值不能包含“|”，当前值为：${value}`)
			}
			return `|${name}=${value}`
		})
		.join('')
}
