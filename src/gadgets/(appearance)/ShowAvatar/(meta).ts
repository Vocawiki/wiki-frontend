import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.util', 'mediawiki.user'],
} satisfies GadgetMeta
