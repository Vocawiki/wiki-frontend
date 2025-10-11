import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

import { MediaWikiApi } from 'wiki-saikou'

import { getPageTitleFromFileName } from '../utils/page'

const { values: args } = parseArgs({
	args: Bun.argv,
	options: {
		summary: {
			type: 'string',
			short: 's',
		},
		help: {
			type: 'boolean',
			short: 'h',
		},
	},
	strict: true,
	allowPositionals: true,
})

if (args.help) {
	console.log('参数:')
	console.log('  -s, --summary <val>    编辑摘要')
	console.log('  -h, --help             显示帮助')
} else {
	await deployPages(await getBuiltPages(), args.summary)
}

interface Page {
	title: string
	content: string
}
async function getBuiltPages(): Promise<Page[]> {
	const entries = await readdir('out/pages', { withFileTypes: true })
	return Promise.all(
		entries.map(async (entry) => {
			assert(entry.isFile(), 'out/pages出现了不是文件的' + entry.name)

			const pageTitle = getPageTitleFromFileName(entry.name)
			const pageContent = await Bun.file(join(entry.parentPath, entry.name)).text()
			return { title: pageTitle, content: pageContent }
		}),
	)
}

async function deployPages(pages: Page[], summary = '推送构建后的代码') {
	const { DEPLOY_USERNAME: username, DEPLOY_PASSWORD: password } = process.env
	assert(username && password, '环境变量中需要有用户名和密码')
	const api = new MediaWikiApi('https://voca.wiki/api.php')
	await api.login(username, password)

	for (const page of pages) {
		await deployPage(api, page, summary)
	}
}

async function deployPage(api: MediaWikiApi, page: Page, summary: string) {
	await api.postWithEditToken({
		action: 'edit',
		format: 'json',
		formatversion: 2,
		title: page.title,
		text: page.content,
		summary,
		tags: 'Bot',
		notminor: true,
		bot: true,
	})
}
