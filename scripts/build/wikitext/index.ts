import * as fs from 'node:fs/promises'

import type { ReactNode } from 'react'

import { SOURCE_DIR_TEMPLATES } from '@/scripts/config'
import { writeBuiltPage } from '@/scripts/utils/page'

import { compileComponent } from '../compilers'
import type { BuildContext } from '../stages-and-context'
import { noticeForEditors } from '../utils/notice'

export function scheduleBuildTasksForWikitextPages(ctx: BuildContext) {
	ctx.scheduleTask(() => buildPagesUnder(SOURCE_DIR_TEMPLATES, 'Template'), {
		after: 'start',
		before: ['saveNondefaultContentModels', 'saveReferencedFiles'],
	})
}

async function buildPagesUnder(dir: string, namespace: string) {
	const tasks = (await fs.readdir(dir, { withFileTypes: true })).map(async (entry) => {
		const dir = `${entry.parentPath}/${entry.name}`
		if (!entry.isDirectory()) {
			throw new Error(`${dir}不是目录`)
		}
		const render = ((await import(`@/${dir}`)) as { default: () => ReactNode }).default
		const reactNode = render()
		const wikitext = await compileComponent(reactNode)
		const notice = noticeForEditors(dir).join('\n\n')
		const content = `<noinclude>\n${notice}\n</noinclude><includeonly>${wikitext}</includeonly>`
		await writeBuiltPage(`${namespace}:${entry.name}`, content)
	})
	await Promise.all(tasks)
}
