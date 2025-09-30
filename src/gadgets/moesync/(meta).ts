import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'moesync.js' },
		{ type: 'existing', name: 'moesync.css' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['oojs-ui', 'mediawiki.diff.styles', 'oojs-ui-core', 'ext.gadget.site-lib'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
