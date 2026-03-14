import { Fragment, type ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export interface WikitextTemplateProps {
	title: string
	args?: Record<string, ReactNode> | ReactNode[]
}

// TODO: 非模板命名空间支持
export function WikitextTemplate({ title, args }: WikitextTemplateProps) {
	let argsParts: ReactNode
	if (!args) {
		argsParts = null
	} else if (Array.isArray(args)) {
		argsParts = args.map((x, i) => <Fragment key={i}>|{x}</Fragment>)
	} else {
		argsParts = Object.entries(args).map(([k, v], i) => (
			<Fragment key={i}>
				|{k}={v}
			</Fragment>
		))
	}

	const wikitext = (
		<>
			{'{{'}
			{title}
			{argsParts}
			{'}}'}
		</>
	)

	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		return <code>{wikitext}</code>
	}

	return wikitext
}
