import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{
			type: 'source',
			entry: 'index.css',
			outputName: 'citizen.css',
		},
	],
	withResourceLoader: false,
	defaultEnabled: true,
	hidden: true,
	type: 'styles',
	availableFor: {
		skins: ['citizen'],
	},
} satisfies GadgetMeta
