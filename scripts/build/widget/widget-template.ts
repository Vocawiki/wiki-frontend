import { escapeHTML } from 'bun'
import type { RequiredDeep } from 'type-fest'

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
	meta: RequiredDeep<WidgetMeta>
}) {
	const noincludeContent = [meta.description, noticeForEditors(srcPath).join('')].filter((x) => x).join('\n\n')
	const identifier = `${name}_called`
	const isClassicScript = meta.script.type === null
	const scriptContent = (isClassicScript ? '"use strict";' : '') + script.trim()
	const scriptAttributes = Object.entries(meta.script)
		.map(([k, v]) => {
			if (v === null || v === false) return null
			if (v === true) return k
			return `${k}="${escapeHTML(v)}"`
		})
		.filter((x) => x)
		.join(' ')

	return `<noinclude>
${noincludeContent}
</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script${scriptAttributes ? ' ' + scriptAttributes : ''}>${scriptContent}</script><!--{/if}--></includeonly>`
}
