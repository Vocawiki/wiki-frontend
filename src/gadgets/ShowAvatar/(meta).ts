import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'ShowAvatar.css' },
		{ type: 'existing', name: 'ShowAvatar.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	availableFor: { skins: ['vector', 'vector-2022'] },
} satisfies GadgetMeta
