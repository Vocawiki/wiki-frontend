import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'popups.css' },
		{ type: 'existing', name: 'popups.js' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: [
		'ext.gadget.site-lib',
		'mediawiki.util',
		'mediawiki.api',
		'mediawiki.user',
		'mediawiki.util',
		'user.options',
		'mediawiki.jqueryMsg',
		'ext.gadget.libPolyfill',
	],
	type: 'general',
} satisfies GadgetMeta
