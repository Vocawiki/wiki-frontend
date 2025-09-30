import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'Wikiplus-highlight.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libOOUIDialog', 'ext.gadget.libPolyfill', 'mediawiki.util'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
