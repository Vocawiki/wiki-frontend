import type { WidgetMeta } from '@/tools/widget'

export default {
	description: '此Widget存放了需要阻塞渲染的JS代码',
	script: {
		attributes: { type: null },
	},
} satisfies WidgetMeta
