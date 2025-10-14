import assert from 'node:assert/strict'

import { construct, crush, shake } from 'radashi'
import type { RequiredDeep } from 'type-fest'

import type { WidgetMeta } from '@/tools/widget'
import { noticeForEditors } from '../utils/notice'

const defaultMeta: RequiredDeep<WidgetMeta> = {
	description: '',
	script: {
		defer: true,
		type: null,
	},
}

function base64(data: string) {
	const buf = Buffer.from(data, 'utf8')
	return buf.toString('base64')
}

// function base64DataURL({ data, mime }: { data: string; mime: string }): string {
// 	return `data:${mime};charset=utf-8;base64,${base64(data)}`
// }

function textDataURL({ data, mime }: { data: string; mime: string }): string {
	return `data:${mime};charset=utf-8,${encodeURIComponent(data).replaceAll(/%[\dA-F]{2}/g, (s) => {
		switch (
			s // Browsers tolerate these characters, and they're frequent
		) {
			case '%2B':
				return '+'
			case '%2F':
				return '/'
			case '%3A':
				return ':'
			case '%3D':
				return '='
			default:
				return s.toLowerCase() // 使得压缩率更高
		}
	})}`
}

const replacements: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
}
function escapeAttributeValueInDoubleQuotes(str: string) {
	return str.replace(/[&<>"]/g, (x) => replacements[x]!)
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
	const isClassicScript = meta.script.type === null
	const isDeferred = meta.script.defer
	const scriptContent = (isClassicScript ? '"use strict";\n' : '') + args.script.trim()
	const scriptAttributes = Object.entries({
		...meta.script,
		...(isDeferred ? { src: textDataURL({ data: scriptContent, mime: 'text/javascript' }) } : {}),
	})
		.map(([k, v]) => {
			if (v === null || v === false) return null
			if (v === true) return k
			return `${k}="${escapeAttributeValueInDoubleQuotes(v)}"`
		})
		.filter((x) => x)
		.join(' ')

	return `<noinclude>
${noincludeContent}
</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script${scriptAttributes ? ' ' + scriptAttributes : ''}>${isDeferred ? '' : scriptContent}</script><!--{/if}--></includeonly>`
}
