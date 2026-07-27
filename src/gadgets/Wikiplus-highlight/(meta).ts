import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: false,
	dependencies: ['ext.gadget.libOOUIDialog', 'mediawiki.util'],
	availableFor: { rights: ['edit'] },
	type: 'general',
} satisfies GadgetMeta
