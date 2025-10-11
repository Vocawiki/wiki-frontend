import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'userpagecat.scss' }],
	withResourceLoader: false,
	defaultEnabled: true,
	type: 'styles',
} satisfies GadgetMeta
