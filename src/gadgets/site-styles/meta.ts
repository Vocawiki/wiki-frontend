import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'source', entry: 'site-styles.scss' }],
	withResourceLoader: false,
	defaultEnabled: true,
	hidden: true,
	type: 'styles',
} satisfies GadgetMeta
