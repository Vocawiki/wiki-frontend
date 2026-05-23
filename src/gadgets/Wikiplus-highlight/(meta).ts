import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'source', entry: 'Wikiplus-highlight.ts' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libOOUIDialog', 'mediawiki.util'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
