'use client'

import { useEffect } from 'react'

export function ClientInitializer() {
	useEffect(() => {
		void import('../../../../src/embeddable-html/(global)/global-head/observe-content-width.ts')
	}, [])
	return null
}
