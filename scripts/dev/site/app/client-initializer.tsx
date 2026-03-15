'use client'

import { useEffect } from 'react'

export function ClientInitializer() {
	useEffect(() => {
		void import('../../../../src/widgets/RenderBlockingSiteScript/index.ts')
	}, [])
	return null
}
