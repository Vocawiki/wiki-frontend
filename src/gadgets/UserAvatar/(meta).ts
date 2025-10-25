import type { GadgetMeta } from '@/tools/gadget/types'

export default {
    pages: [
		{ type: 'existing', name: 'UserAvatar.js' },
		{ type: 'existing', name: 'UserAvatar.css' },
	],
    withResourceLoader: true,
    defaultEnabled: true,
    type: 'general',
} satisfies GadgetMeta
