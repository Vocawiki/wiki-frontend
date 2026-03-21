import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'SideBarPic.css' },
		{ type: 'source', entry: 'SideBarPic.ts' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.Uri'],
	type: 'general',
} satisfies GadgetMeta
