import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'site-lib.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['mediawiki.util'],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
