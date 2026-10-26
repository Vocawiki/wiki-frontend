import type { GadgetMeta } from '@/tools/gadget'

export default {
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: ['mediawiki.api', 'oojs-ui', 'ext.gadget.libCachedCode'],
	availableFor: { rights: ['editinterface'], namespaces: [8] },
	type: 'general',
} satisfies GadgetMeta
