import type { ReactNode } from 'react'

export function WikitextNoInclude({ children }: { children: ReactNode }) {
	// @ts-expect-error MediaWiki专有标签
	return <noinclude>{children}</noinclude>
}

export function WikitextIncludeOnly({ children }: { children: ReactNode }) {
	// @ts-expect-error MediaWiki专有标签
	return <includeonly>{children}</includeonly>
}

export function WikitextOnlyInclude({ children }: { children: ReactNode }) {
	// @ts-expect-error MediaWiki专有标签
	return <onlyinclude>{children}</onlyinclude>
}
