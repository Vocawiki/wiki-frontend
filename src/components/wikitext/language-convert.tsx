import type { ReactNode } from 'react'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export function WikitextNoLanguageConversion({ children }: { children: ReactNode }) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) return children
	return (
		<>
			{'-{'}
			{children}
			{'}-'}
		</>
	)
}
