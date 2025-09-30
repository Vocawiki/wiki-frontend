import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [
		{ type: 'existing', name: 'sidebarHidden.css' },
		{ type: 'existing', name: 'sidebarHidden.js' },
	],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.LocalObjectStorage'],
	availableFor: { skins: ['vector'] },
	type: 'general',
} satisfies GadgetMeta
