import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'existing', name: 'Wikiplus.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libCachedCode'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
