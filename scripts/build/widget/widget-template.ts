import assert from 'node:assert/strict'

import { noticeForEditors } from '../utils/notice'

export function getWidgetCode(args: { name: string; description?: string; srcPath: string; script: string }) {
	assert.match(args.srcPath, /^src\//, '必须使用“src/”开头的路径')
	assert.match(args.name, /^[A-Za-z]\w*$/, '不支持的name')

	const noinclude = [args.description, noticeForEditors(args.srcPath).join('')].filter((x) => x).join('\n\n')

	const identifier = `${args.name}_called`

	return `<noinclude>${noinclude}</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}--><!--{assign var="${identifier}" value=true scope="global"}--><script type="module">
${args.script.trim()}
</script><!--{/if}--></includeonly>
`
}
