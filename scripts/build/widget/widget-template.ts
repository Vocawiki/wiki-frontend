import assert from 'node:assert/strict'

import { escapeHTML } from 'bun'
import { construct, crush, shake } from 'radashi'
import type { RequiredDeep } from 'type-fest'

import type { WidgetMeta } from '@/tools/widget'
import { noticeForEditors } from '../utils/notice'

const defaultMeta: RequiredDeep<WidgetMeta> = {
	description: '',
	script: {
		attributes: {
			type: 'module',
		},
	},
}

export async function getWidgetCode(args: { name: string; srcPath: string; script: string }) {
	assert.match(args.srcPath, /^src\//, '必须使用“src/”开头的路径')
	assert.match(args.name, /^[A-Za-z]\w*$/, '不支持的name')

	const inputtedMeta = ((await import(`@/src/widgets/${args.name}/(meta)`)) as { default: WidgetMeta }).default

	let meta: RequiredDeep<WidgetMeta>
	try {
		meta = construct({
			...crush(defaultMeta),
			...shake(crush(inputtedMeta)),
		}) as RequiredDeep<WidgetMeta>
	} catch {
		meta = defaultMeta
	}

	const noincludeContent = [meta.description, noticeForEditors(args.srcPath).join('')].filter((x) => x).join('\n\n')
	const identifier = `${args.name}_called`
	const scriptAttributes = Object.entries(meta.script.attributes)
		.map(([k, v]) => {
			if (v === null || v === false) return null
			if (v === true) return k
			return `${k}="${escapeHTML(v)}"`
		})
		.filter((x) => x)
		.join(' ')
	const isClassicScript = meta.script.attributes.type === null
	const scriptContent = (isClassicScript ? '"use strict";\n' : '') + args.script.trim()

	return `<noinclude>${noincludeContent}</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script${scriptAttributes ? ' ' + scriptAttributes : ''}>
${scriptContent}
</script><!--{/if}--></includeonly>
`
}
