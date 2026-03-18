'use client'

import type { ReactNode } from 'react'

export function BackButton({
	children = '返回',
	linkLike,
}: {
	children?: ReactNode
	linkLike?: boolean
}) {
	const back = () => {
		history.back()
	}

	if (linkLike) {
		return (
			<a href="#" onClick={back}>
				{children}
			</a>
		)
	}

	return (
		<button type="button" onClick={back}>
			{children}
		</button>
	)
}
