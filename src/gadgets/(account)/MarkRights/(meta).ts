import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'existing', name: 'MarkRights.css' },
		{ type: 'existing', name: 'MarkRights.js' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
} satisfies GadgetMeta
