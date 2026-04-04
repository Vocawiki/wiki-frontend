import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'existing', name: 'shortlink.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.site-lib', 'mediawiki.widgets'],
} satisfies GadgetMeta
