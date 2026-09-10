import type {
	ScriptWidgetMeta,
	ScriptWidgetMeta_ClassicInlineNoChunk,
	ScriptWidgetMeta_Module,
	ScriptWidgetMeta_ModuleInline,
	WidgetMeta,
} from '@/tools/widget'

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

export function formatScriptWidgetBanner(options: {
	widgetName: string
	scriptSourceUrl: string
	meta: ScriptWidgetMeta_Module
}): string
export function formatScriptWidgetBanner(options: {
	widgetName: string
	meta: ScriptWidgetMeta_ModuleInline | ScriptWidgetMeta_ClassicInlineNoChunk
}): string
export function formatScriptWidgetBanner({
	widgetName,
	scriptSourceUrl,
	meta,
}: {
	widgetName: string
	scriptSourceUrl?: string
	meta: ScriptWidgetMeta
}): string {
	const noincludeContent = [
		meta.description,
		noticeForEditors(`src/widgets/${widgetName}`).join(''),
	]
		.filter((x) => x)
		.join('\n\n')
	const identifier = `${widgetName}_called`
	const scriptAttributes = (() => {
		if (meta.scriptType === 'module') {
			return `src="${scriptSourceUrl}" type="module"`
		}
		if (meta.scriptType === 'module-inline') {
			return 'type="module"'
		}
		if (meta.scriptType === 'classic-inline-no-chunk') {
			return ''
		}
		throw new Error('未知scriptType')
	})()
	return (
		`<noinclude>\n${noincludeContent}\n</noinclude><includeonly>` +
		`<!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}-->` +
		`<script${scriptAttributes ? ` ${scriptAttributes}` : ''}>`
	)
}

export const SCRIPT_WIDGET_FOOTER = '</script><!--{/if}--></includeonly>'
