import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{
			type: 'source',
			entry: 'index.css',
			outputName: 'vector.css',
		},
	],
	withResourceLoader: false,
	defaultEnabled: true,
	hidden: true,
	type: 'styles',
	availableFor: {
		skins: ['vector'],
	},
} satisfies GadgetMeta
