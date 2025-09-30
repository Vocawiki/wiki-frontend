import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'site-js.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.libOOUIDialog', 'user', 'mediawiki.api'],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
