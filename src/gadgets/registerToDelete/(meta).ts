import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'existing', name: 'registerToDelete.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	type: 'general',
	dependencies: [
		'ext.gadget.libOOUIDialog',
		'ext.gadget.site-lib',
		'ext.gadget.LocalObjectStorage',
	],
	availableFor: { rights: ['edit'] },
} satisfies GadgetMeta
