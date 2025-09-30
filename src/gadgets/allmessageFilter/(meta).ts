import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'allmessageFilter.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.libOOUIDialog'],
	availableFor: { rights: ['editinterface'] },
	type: 'general',
} satisfies GadgetMeta
