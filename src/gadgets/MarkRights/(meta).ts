import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'MarkRights.css' },
		{ type: 'existing', name: 'MarkRights.js' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
} satisfies GadgetMeta
