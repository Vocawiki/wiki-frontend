import type { ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export function WikitextNoInclude({ children }: { children: ReactNode }): ReactNode {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return null

	// @ts-expect-error MediaWiki专有标签
	return <noinclude>{children}</noinclude>
}

export function WikitextIncludeOnly({ children }: { children: ReactNode }): ReactNode {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return children

	// @ts-expect-error MediaWiki专有标签
	return <includeonly>{children}</includeonly>
}

export function WikitextOnlyInclude({ children }: { children: ReactNode }): ReactNode {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		console.warn('模拟的`<onlyinclude></onlyinclude>`行为与真实的不同')
		return children
	}

	// @ts-expect-error MediaWiki专有标签
	return <onlyinclude>{children}</onlyinclude>
}
