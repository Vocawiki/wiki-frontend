import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'source', entry: 'heimu-toggle-defaultOn.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.heimuToggle'],
} satisfies GadgetMeta
