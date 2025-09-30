import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'mwPanel.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.site-lib'],
	type: 'general',
} satisfies GadgetMeta
