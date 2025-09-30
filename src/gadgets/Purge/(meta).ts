import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'Purge.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.site-lib'],
} satisfies GadgetMeta
