import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'deletion.css' },
		{ type: 'existing', name: 'deletion.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: [
		'ext.gadget.site-lib',
		'ext.gadget.libOOUIDialog',
		'mediawiki.util',
		'mediawiki.api',
	],
	availableFor: { rights: ['delete'], namespaces: [14] },
	type: 'general',
} satisfies GadgetMeta
