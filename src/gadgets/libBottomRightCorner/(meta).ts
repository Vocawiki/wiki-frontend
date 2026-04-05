import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'libBottomRightCorner.js' },
		{ type: 'source', entry: 'libBottomRightCorner.css' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	hidden: true,
} satisfies GadgetMeta
