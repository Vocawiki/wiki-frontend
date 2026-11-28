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
			// oxlint-disable-next-line jsx-a11y/anchor-is-valid -- 开发用，不影响
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
