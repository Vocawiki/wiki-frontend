import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'noteTA.css' },
		{ type: 'existing', name: 'noteTA.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: [
		'mediawiki.api',
		'ext.gadget.site-lib',
		'query.makeCollapsible',
		'mediawiki.Uri',
		'jquery.ui',
	],
	type: 'general',
} satisfies GadgetMeta
