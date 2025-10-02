import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'Cat-a-lot.css' },
		{ type: 'existing', name: 'Cat-a-lot.js' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['mediawiki.util'],
	type: 'general',
	availableFor: {
		namespaces: [14],
	},
} satisfies GadgetMeta
