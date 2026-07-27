import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'source', entry: 'site-js.ts' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['ext.gadget.libOOUIDialog', 'user', 'ext.gadget.site-lib', 'mediawiki.api'],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
