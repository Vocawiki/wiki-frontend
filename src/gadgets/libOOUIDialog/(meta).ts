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
		'ext.gadget.libPolyfill',
	],
	hidden: true,
	availableFor: { targets: ['desktop', 'mobile'] },
	type: 'general',
} satisfies GadgetMeta
