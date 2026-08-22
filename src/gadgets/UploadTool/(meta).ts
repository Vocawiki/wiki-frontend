import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['mediawiki.api', 'mediawiki.util'],
	availableFor: { rights: ['upload'] },
	type: 'general',
} satisfies GadgetMeta
