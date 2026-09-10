import assert from 'node:assert/strict'

import { PAGES_DIR } from '../config'

const invalidCharSymbol = Symbol('invalid character in page title')

const [escapeMap, unescapeMap] = (() => {
	const escapeMapRecord: Record<string, string | typeof invalidCharSymbol> = {
		'\\': 'b',
		'/': 's',
		':': 'c',
		'*': 'a',
		'?': 'q',
		'"': 'Q',
		'#': invalidCharSymbol,
		'<': invalidCharSymbol,
		'>': invalidCharSymbol,
		'[': invalidCharSymbol,
		']': invalidCharSymbol,
		'{': invalidCharSymbol,
		'|': invalidCharSymbol,
		'}': invalidCharSymbol,
	}
	return [
		new Map(Object.entries(escapeMapRecord)),
		new Map(
			Object.entries(escapeMapRecord)
				.filter(([, v]) => v !== invalidCharSymbol)
				.map(([k, v]) => [v, k]),
		),
	]
})()

export function escapePageTitle(title: string): string {
	return title
		.split('')
		.map((char) => {
			assert.notEqual(char, '_', `转义不支持标题中含有“_”，请将标题中的“_”换成空格。标题：${title}`)
			const escaped = escapeMap.get(char)
			if (escaped === undefined) return char
			assert(escaped !== invalidCharSymbol, `页面标题包含无法使用的字符: ${char}，标题: ${title}`)
			return '_' + escaped
		})
		.join('')
}

function unescapePageTitle(str: string): string {
	return str.replace(/#(.)/g, (_, char: string) => {
		const unescaped = unescapeMap.get(char)
		assert(unescaped !== undefined, `页面标题包含未知转义序列: #${char}，标题: ${str}`)
		return unescaped
	})
}

export async function writeBuiltPage(title: string, content: string) {
	const fileName = escapePageTitle(title) + '.txt'
	await Bun.write(`${PAGES_DIR}/${fileName}`, content)
}

export function getPageTitleFromFileName(fileName: string) {
	const match = fileName.match(/^(.*).txt$/)
	assert(match, '文件名不是以.txt结尾的：' + fileName)
	return unescapePageTitle(match[1]!)
}
