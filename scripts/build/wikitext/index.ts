import { readdir } from 'node:fs/promises'

import type { ReactNode } from 'react'

import { writeBuiltPage } from '@/scripts/utils/page'

import { compileComponent } from '../compilers'
import { noticeForEditors } from '../utils/notice'

export async function buildWikitextPages() {
	await buildPagesUnder('src/templates', 'Template')
}

async function buildPagesUnder(dir: string, namespace: string) {
	const tasks = (await readdir(dir, { withFileTypes: true })).map(async (entry) => {
		const dir = `${entry.parentPath}/${entry.name}`
		if (!entry.isDirectory()) {
			throw new Error(`${dir}不是目录`)
		}
		const render = ((await import(`@/${dir}`)) as { default: () => ReactNode }).default
		const reactNode = render()
		const wikitext = await compileComponent(reactNode)
		const notice = noticeForEditors(dir).join('\n\n')
		const content = `<noinclude>\n${notice}\n</noinclude>${wikitext}`
		await writeBuiltPage(`${namespace}:${entry.name}`, content)
	})
	await Promise.all(tasks)
}
