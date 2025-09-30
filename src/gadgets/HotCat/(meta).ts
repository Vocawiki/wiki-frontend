import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'HotCat.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	availableFor: { rights: ['edit'] },
} satisfies GadgetMeta
