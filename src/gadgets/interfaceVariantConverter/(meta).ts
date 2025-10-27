import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'interfaceVariantConverter.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: [
		'mediawiki.api',
		'mediawiki.ForeignApi',
		'oojs-ui',
		'ext.gadget.libPolyfill',
		'ext.gadget.libCachedCode',
	],
	availableFor: { rights: ['editinterface'], namespaces: [8] },
	type: 'general',
} satisfies GadgetMeta
