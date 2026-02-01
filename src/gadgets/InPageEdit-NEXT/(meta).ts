import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'InPageEdit-NEXT.css' },
		{ type: 'source', entry: 'InPageEdit-NEXT.js' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	type: 'general',
} satisfies GadgetMeta
