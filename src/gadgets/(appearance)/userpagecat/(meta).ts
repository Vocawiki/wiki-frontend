import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: false,
	defaultEnabled: true,
	type: 'styles',
	availableFor: {
		namespaces: [2],
	},
} satisfies GadgetMeta
