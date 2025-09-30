import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'LocalObjectStorage.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libPolyfill'],
	hidden: true,
	availableFor: { targets: ['desktop', 'mobile'] },
	type: 'general',
} satisfies GadgetMeta
