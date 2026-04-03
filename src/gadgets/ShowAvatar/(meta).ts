import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'ShowAvatar.css' },
		{ type: 'source', entry: 'ShowAvatar.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.util', 'mediawiki.user'],
} satisfies GadgetMeta
