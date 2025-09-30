import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'SideBarPic.css' },
		{ type: 'existing', name: 'SideBarPic.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.Uri'],
	type: 'general',
} satisfies GadgetMeta
