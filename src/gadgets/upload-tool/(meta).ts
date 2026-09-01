import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.site-lib', 'mediawiki.util'],
	availableFor: { rights: ['upload'], namespaces: [-1] },
	type: 'general',
} satisfies GadgetMeta
