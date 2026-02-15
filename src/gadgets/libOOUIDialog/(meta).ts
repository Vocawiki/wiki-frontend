import type { GadgetMeta } from '@/tools/gadget/types'

export default {
	pages: [{ type: 'existing', name: 'libOOUIDialog.js' }],
	withResourceLoader: true,
	defaultEnabled: true,
	dependencies: [
		'oojs-ui',
		'oojs-ui-widgets',
		'oojs-ui.styles.indicators',
		'oojs-ui.styles.icons-alerts',
	],
	hidden: true,
	type: 'general',
} satisfies GadgetMeta
