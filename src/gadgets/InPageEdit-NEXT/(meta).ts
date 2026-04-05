import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		{ type: 'source', entry: 'InPageEdit-NEXT.css' },
		{ type: 'source', entry: 'InPageEdit-NEXT.ts' },
	],
	withResourceLoader: true,
	defaultEnabled: false,
	type: 'general',
} satisfies GadgetMeta
