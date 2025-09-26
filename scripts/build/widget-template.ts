export function getWidgetCode(args: { name: string; description?: string; srcPath: string; script: string }) {
	if (!args.srcPath.startsWith('src/')) {
		throw new RangeError('必须使用“src/”开头的路径')
	}
	if (!args.name.match(/^[A-Za-z]\w*$/)) {
		throw new RangeError('name不符合/^[A-Za-z][A-Za-z0-9_]*$/')
	}
	const noinclude = [
		args.description,
		`此文件为自动生成，手动修改将会被覆盖，请至[https://github.com/Vocawiki/wiki-frontend/blob/${args.srcPath}]修改源代码。`,
	]
		.filter((x) => x)
		.join('\n\n')

	const identifier = `${args.name}_called`

	return `<noinclude>${noinclude}</noinclude><includeonly><!--{if !isset($${identifier}) || !$${identifier}}{assign var="${identifier}" value=true scope="global"}--><script type="module">
${args.script.trim()}
</script><!--{/if}--></includeonly>
`
}
