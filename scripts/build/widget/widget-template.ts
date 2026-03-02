import type { ScriptWidgetMeta, WidgetMeta } from '@/tools/widget'

import { noticeForEditors } from '../utils/notice'

export function toWidgetWikiContent({
	widgetName,
	content,
	meta,
}: {
	widgetName: string
	content: string
	meta: WidgetMeta
}): string {
	const noincludeContent = [
		meta.description,
		noticeForEditors(`src/widgets/${widgetName}`).join(''),
	]
		.filter((x) => x)
		.join('\n\n')

	return `<noinclude>
${noincludeContent}
</noinclude><includeonly>${content}</includeonly>`
}

export function toScriptWidgetWikiContent({
	widgetName,
	script,
	meta,
}: {
	widgetName: string
	script: string
	meta: ScriptWidgetMeta
}) {
	const identifier = `${widgetName}_called`
	const isClassicScript = meta.scriptType === 'classic'
	const scriptContent = (isClassicScript ? '"use strict";' : '') + script.trim()
	const scriptAttributes = meta.scriptType === 'module' ? 'type="module"' : ''
	const content = `<!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script${scriptAttributes ? ` ${scriptAttributes}` : ''}>${scriptContent}</script><!--{/if}-->`

	return toWidgetWikiContent({ widgetName, content, meta })
}
