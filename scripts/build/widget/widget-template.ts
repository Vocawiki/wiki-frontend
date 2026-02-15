import type { WidgetMeta } from '@/tools/widget'

import { noticeForEditors } from '../utils/notice'

export function getWidgetCode({
	name,
	srcPath,
	script,
	meta,
}: {
	name: string
	srcPath: string
	script: string
	meta: WidgetMeta
}) {
	const noincludeContent = [meta.description, noticeForEditors(srcPath).join('')]
		.filter((x) => x)
		.join('\n\n')
	const identifier = `${name}_called`
	const isClassicScript = meta.script.type === 'classic'
	const scriptContent = (isClassicScript ? '"use strict";' : '') + script.trim()
	const scriptAttributes = meta.script.type === 'module' ? 'type="module"' : ''

	return `<noinclude>
${noincludeContent}
</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script${scriptAttributes ? ` ${scriptAttributes}` : ''}>${scriptContent}</script><!--{/if}--></includeonly>`
}
