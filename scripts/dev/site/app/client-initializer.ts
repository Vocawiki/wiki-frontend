'use client'

import { useEffect } from 'react'

export function ClientInitializer() {
	useEffect(() => {
		void import('../../../../src/embeddable-html/RenderBlockingSiteScript/index.ts')
	}, [])
	return null
}
