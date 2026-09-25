import type { IsEqual } from 'type-fest'

import type { Expect } from '@/lib/typing'
import type {
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

export function formatScriptWidgetBanner(
	options:
		| {
				widgetName: string
				scriptSourceUrl: string
				meta: ScriptWidgetMeta_Module
		  }
		| {
				widgetName: string
				scriptSourceUrl?: never
				meta: ScriptWidgetMeta_ModuleInline | ScriptWidgetMeta_ClassicInlineNoChunk
		  },
): string {
	const { widgetName, meta } = options
	const noincludeContent = [
		meta.description,
		noticeForEditors(`src/widgets/${widgetName}`).join(''),
	]
		.filter((x) => x)
		.join('\n\n')
	const identifier = `${widgetName}_called`
	const scriptAttributes = (() => {
		if (meta.scriptType === 'module') {
			return `src="${options.scriptSourceUrl!}" type="module"`
		}
		if (meta.scriptType === 'module-inline') {
			return 'type="module"'
		}
		type _Check = Expect<IsEqual<typeof meta.scriptType, 'classic-inline-no-chunk'>>
		return ''
	})()
	return (
		`<noinclude>\n${noincludeContent}\n</noinclude><includeonly>` +
		`<!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}-->` +
		`<script${scriptAttributes ? ` ${scriptAttributes}` : ''}>`
	)
}

export const SCRIPT_WIDGET_FOOTER = '</script><!--{/if}--></includeonly>'
