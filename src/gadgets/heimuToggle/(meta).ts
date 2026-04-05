import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'heimu-toggle.js' },
		{ type: 'source', entry: 'heimu-toggle.css' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['user.options', 'ext.gadget.libBottomRightCorner', 'ext.gadget.site-lib'],
} satisfies GadgetMeta
