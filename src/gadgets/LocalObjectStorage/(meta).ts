import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'LocalObjectStorage.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	hidden: true,
	availableFor: { targets: ['desktop', 'mobile'] },
	type: 'general',
} satisfies GadgetMeta
