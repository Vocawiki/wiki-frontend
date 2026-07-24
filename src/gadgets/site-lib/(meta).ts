import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['mediawiki.util'],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
