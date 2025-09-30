import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'rollback-summary.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.libOOUIDialog', 'mediawiki.api', 'ext.gadget.site-lib'],
	availableFor: { rights: ['rollback'] },
	type: 'general',
} satisfies GadgetMeta
