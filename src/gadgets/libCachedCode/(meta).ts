import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'libCachedCode.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.LocalObjectStorage'],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
