'use client'

import type { ReactNode } from 'react'

const back = () => {
	history.back()
}

export function BackButton({
	children = '返回',
	linkLike,
}: {
	children?: ReactNode
	linkLike?: boolean
}) {
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
