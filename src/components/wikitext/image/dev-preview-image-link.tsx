'use client'

import type { ReactNode } from 'react'

import { normalizeWikiTitleForURL, withBaseURL } from '@/lib/wiki'

export function DevPreviewImageLink({
	fileName,
	children,
}: {
	fileName: string
	children?: ReactNode
}) {
	const normalizedTitle = 'File:' + normalizeWikiTitleForURL(fileName)
	return (
		<a
			href={withBaseURL(`/${normalizedTitle}`)}
			onClick={(e) => {
				e.preventDefault()
				location.hash = '#/media/' + normalizedTitle
			}}
			className="mw-file-description"
		>
			{children}
		</a>
	)
}
