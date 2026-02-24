import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'existing', name: 'CleanDeleteReasons.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	availableFor: { rights: ['delete'], actions: ['delete'] },
	type: 'general',
} satisfies GadgetMeta
