import type { ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export function LangSpan({ lang, children }: { lang: 'ja'; children: ReactNode }) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return <span lang={lang}>{children}</span>

	return (
		<>
			{'{{lj|'}
			{children}
			{'}}'}
		</>
	)
}
