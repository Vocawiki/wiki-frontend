import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'RandomSong.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.api'],
	type: 'general',
} satisfies GadgetMeta
