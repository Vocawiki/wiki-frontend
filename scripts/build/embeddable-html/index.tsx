import { readdir } from 'node:fs/promises'

import pMap from 'p-map'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { IsEqual } from 'type-fest'

import type { Expect } from '@/lib/typing'
import { normalizeWikiTitle } from '@/lib/wiki'
import { SOURCE_DIR_EMBEDDABLE_HTML } from '@/scripts/config'
import { getFileInfo } from '@/scripts/utils/file-info'
import { writeBuiltPage } from '@/scripts/utils/page'
import type { EmbeddableHtmlMeta } from '@/tools/embeddable-html'

import type { ContentModel } from '../../types'
import { compileComponent } from '../compilers'
import { compileJS } from '../compilers/js-compiler'
import type { ScriptBuildEntry } from '../types'
import { findCodeEntries } from '../utils/code-entry'

export async function buildEmbeddableHtmlSnippets(options: {
	onScriptEntryFound: (entry: ScriptBuildEntry) => void
	onNondefaultContentModelFound: (title: string, contentModel: ContentModel) => void
}) {
	const embeddableHtmlEntries = await findEmbeddableHtmlEntries(SOURCE_DIR_EMBEDDABLE_HTML)
	await Promise.all(
		embeddableHtmlEntries.map((entity) => buildEmbeddableHtmlSnippet(entity, options)),
	)
}

interface EmbeddableHtmlSourceInfo {
	name: string
	path: string
	entryFileName: string
	meta: EmbeddableHtmlMeta
}

/**
 * 查找 dir 下的 index.xx 文件
 * @returns 文件名
 */
async function findIndexFile(dir: string): Promise<string> {
	for (const x of await readdir(dir, { withFileTypes: true })) {
		if (x.isFile() && getFileInfo(x.name).baseName === 'index') {
			return x.name
		}
	}
	throw new Error(`${dir}下不存在入口文件`)
}

async function findEmbeddableHtmlEntries(dir: string): Promise<EmbeddableHtmlSourceInfo[]> {
	const entries = await findCodeEntries(dir)
	return pMap(entries, async ({ name, path }): Promise<EmbeddableHtmlSourceInfo> => {
		const [entryFileName, meta] = await Promise.all([
			findIndexFile(path),
			import(`@/${path}/(meta)`).then((x) => (x as { default: EmbeddableHtmlMeta }).default),
		])
		return { name, path, entryFileName, meta }
	})
}

async function buildEmbeddableHtmlSnippet(
	{ name, path, entryFileName, meta }: EmbeddableHtmlSourceInfo,
	{
		onScriptEntryFound,
		onNondefaultContentModelFound,
	}: {
		onScriptEntryFound: (entry: ScriptBuildEntry) => void
		onNondefaultContentModelFound: (title: string, contentModel: ContentModel) => void
	},
) {
	const mwPageTitle = normalizeWikiTitle(`HTML:${name}`)
	const entryPath = `${path}/${entryFileName}`

	switch (meta.type) {
		case 'script': {
			switch (meta.position) {
				case 'in-place':
					break
				case 'head':
					onNondefaultContentModelFound(mwPageTitle, 'headhtml')
					break
				case 'body':
					onNondefaultContentModelFound(mwPageTitle, 'bodyhtml')
					break
			}

			if (meta.scriptType === 'module') {
				onScriptEntryFound({
					type: 'asset',
					name,
					path: entryPath,
					onBuildSuccess: async (scriptSourceUrl) => {
						const content = renderToStaticMarkup(<script type="module" src={scriptSourceUrl} />)
						await writeBuiltPage(mwPageTitle, content)
					},
				})
				return
			}
			if (meta.scriptType === 'module-inline') {
				onScriptEntryFound({
					type: 'mw-page',
					title: mwPageTitle,
					meta: {
						path: entryPath,
						format: 'es',
						postBanner: '<script type="module">',
						postFooter: '</script>',
						sourceMap: false,
					},
				})
				return
			}
			type _Check = Expect<IsEqual<typeof meta.scriptType, 'classic-inline-no-import'>>

			const code = await compileJS({ input: entryPath }, { format: 'iife', strict: true })
			const content = `<script>${code}</script>`
			await writeBuiltPage(mwPageTitle, content)
			return
		}

		case 'static-markup': {
			const Component = (
				(await import(`@/${path}/${entryFileName}`)) as { default: () => ReactNode }
			).default
			// oxlint-disable-next-line new-cap
			const html = await compileComponent(Component())
			await writeBuiltPage(mwPageTitle, html)
		}
	}
}
