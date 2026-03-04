import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{
			type: 'source',
			entry: 'index.css',
			outputName: 'vector-2022.css',
		},
	],
	withResourceLoader: false,
	defaultEnabled: true,
	hidden: true,
	type: 'styles',
	availableFor: {
		skins: ['vector-2022'],
	},
} satisfies GadgetMeta
