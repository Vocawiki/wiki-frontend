import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'InPageEdit-NEXT.js' }],
	withResourceLoader: true,
	defaultEnabled: false,
	availableFor: { rights: ['rollback'] },
	type: 'general',
} satisfies GadgetMeta
