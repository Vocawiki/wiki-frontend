import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'existing', name: 'editCount.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	availableFor: { skins: ['vector', 'vector-2022'] },
} satisfies GadgetMeta
