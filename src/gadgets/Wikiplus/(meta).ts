import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'Wikiplus.ts' },
		{ type: 'source', entry: 'Wikiplus.css' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libCachedCode'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
