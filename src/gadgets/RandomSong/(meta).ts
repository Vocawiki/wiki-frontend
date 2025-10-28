import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'RandomSong.ts' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.api', 'ext.gadget.site-lib'],
	type: 'general',
} satisfies GadgetMeta
