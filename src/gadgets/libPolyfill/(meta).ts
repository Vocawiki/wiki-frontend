import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'libPolyfill.js' },
		{ type: 'existing', name: 'libPolyfill-crypto.randomUUID.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	hidden: true,
	availableFor: { targets: ['desktop', 'mobile'] },
	type: 'general',
} satisfies GadgetMeta
