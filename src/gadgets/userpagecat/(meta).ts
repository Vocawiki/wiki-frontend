import type { GadgetMeta } from '@/tools/gadget'

export default {
	pages: [{ type: 'source', entry: 'userpagecat.css' }],
	withResourceLoader: false,
	defaultEnabled: true,
	type: 'styles',
} satisfies GadgetMeta
