import type { WidgetMeta } from '@/tools/widget'

export default {
	description: '此Widget存放了需要阻塞渲染的全站JS代码。',
	script: { type: 'module' },
} satisfies WidgetMeta
