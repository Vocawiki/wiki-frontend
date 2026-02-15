import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'Wikiplus-highlight.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libOOUIDialog', 'mediawiki.util'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
