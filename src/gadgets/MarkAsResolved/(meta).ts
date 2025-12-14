import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'MarkAsResolved.css' },
		{ type: 'existing', name: 'MarkAsResolved.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: [
		'mediawiki.api',
		'ext.gadget.libPolyfill',
		'ext.gadget.libOOUIDialog',
		'ext.gadget.site-lib',
		'ext.gadget.libDiscussionUtil',
	],
	type: 'general',
} satisfies GadgetMeta
