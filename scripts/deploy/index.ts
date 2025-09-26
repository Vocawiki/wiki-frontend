import { readdir } from 'node:fs/promises'
import { join } from 'node:path'

import { MediaWikiApi } from 'wiki-saikou'

interface Page {
	title: string
	content: string
}
async function getBuiltPages(): Promise<Page[]> {
	const entries = await readdir('out/pages', { withFileTypes: true })
	return Promise.all(
		entries.map(async (entry) => {
			if (!entry.isFile()) throw new Error('out/pages出现了不是文件的' + entry.name)

			const pageName = entry.name.replace('#', ':').replace(/.txt$/, '')
			const pageContent = await Bun.file(join(entry.parentPath, entry.name)).text()
			return { title: pageName, content: pageContent }
		}),
	)
}

async function pushPages(pages: Page[]) {
	const { DEPLOY_USERNAME: username, DEPLOY_PASSWORD: password } = process.env
	if (!(username && password)) {
		throw new Error('环境变量中需要有用户名和密码')
	}
	const api = new MediaWikiApi('https://voca.wiki/api.php')
	await api.login(username, password)
	for (const page of pages) {
		await pushPage(api, page)
	}
}

async function pushPage(api: MediaWikiApi, page: Page, summary = '测试') {
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

// await pushPages(await getBuiltPages())
await pushPages([{ title: 'Help:沙盒', content: '初音未来\n\n初音来了' }])
