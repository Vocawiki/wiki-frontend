import { readdir } from 'node:fs/promises'
import path from 'node:path'

import pMap from 'p-map'
import { renderToStaticMarkup } from 'react-dom/server'
import type { IsEqual } from 'type-fest'

import type { Expect } from '@/lib/typing'
import { normalizeWikiTitle } from '@/lib/wiki'
import { SOURCE_DIR_EMBEDDABLE_HTML } from '@/scripts/config'
import { getFileInfo } from '@/scripts/utils/file-info'
import { writeBuiltPage } from '@/scripts/utils/page'
import type { EmbeddableHtmlMeta, GetStaticPropsContext } from '@/tools/embeddable-html'

import { compileComponent } from '../compilers'
import { compileJS } from '../compilers/js-compiler'
import type { BuildContext } from '../stages-and-context'
import { findCodeEntries } from '../utils/code-entry'
import type { StaticMarkupEmbeddableHtmlIndexModule } from './types'

interface EmbeddableHtmlSourceInfo {
	name: string
	path: string
	entryFileName: string
	mwTitle: string
	meta: EmbeddableHtmlMeta
}

export function scheduleBuildTasksForEmbeddableHtml(ctx: BuildContext) {
	ctx.scheduleTask(
		async () => {
			const entries = await findEmbeddableHtmlEntries(SOURCE_DIR_EMBEDDABLE_HTML)

			entries.map((info) => {
				const { meta, mwTitle } = info
				switch (meta.position) {
					case 'in-place':
						break
					case 'head':
						ctx.registerNondefaultContentModel(mwTitle, 'headhtml')
						break
					case 'body':
						ctx.registerNondefaultContentModel(mwTitle, 'bodyhtml')
						break
				}

				if (meta.type === 'script') {
					scheduleScript(info as EmbeddableHtmlSourceInfo & { meta: { type: 'script' } }, ctx)
				} else {
					type _Check = Expect<IsEqual<typeof meta.type, 'static-markup'>>
					scheduleStaticMarkup(
						info as EmbeddableHtmlSourceInfo & { meta: { type: 'static-markup' } },
						ctx,
					)
				}
			})
		},
		{
			after: 'start',
			before: ['buildScriptEntries', 'saveNondefaultContentModels', 'saveReferencedFiles'],
		},
	)
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
		return { name, path, entryFileName, meta, mwTitle: normalizeWikiTitle(`HTML:${name}`) }
	})
}

function scheduleScript(
	{
		meta,
		name,
		entryFileName,
		path,
		mwTitle,
	}: EmbeddableHtmlSourceInfo & { meta: { type: 'script' } },
	ctx: BuildContext,
) {
	const entryPath = `${path}/${entryFileName}`

	if (meta.scriptType === 'module') {
		ctx.registerScriptEntry({
			type: 'asset',
			name,
			path: entryPath,
			onBuildSuccess: async (scriptSourceUrl) => {
				const content = renderToStaticMarkup(<script type="module" src={scriptSourceUrl} />)
				await writeBuiltPage(mwTitle, content)
			},
		})
		return
	}
	if (meta.scriptType === 'module-inline') {
		ctx.registerScriptEntry({
			type: 'mw-page',
			title: mwTitle,
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

	ctx.scheduleTask(
		async () => {
			const code = await compileJS({ input: entryPath }, { format: 'iife', strict: true })
			const content = `<script>${code}</script>`
			await writeBuiltPage(mwTitle, content)
		},
		{ after: 'start', before: 'saveReferencedFiles' },
	)
}

function generateScriptEntryName(fileBaseName: string, entryName: string): string {
	if (fileBaseName === entryName) {
		return fileBaseName
	} else if (fileBaseName === 'script') {
		return entryName
	}
	return `${entryName}-${fileBaseName}`
}

function scheduleStaticMarkup(
	entry: EmbeddableHtmlSourceInfo & { meta: { type: 'static-markup' } },
	ctx: BuildContext,
) {
	ctx.scheduleTask(
		async () => {
			const module = (await import(`@/${entry.path}`)) as StaticMarkupEmbeddableHtmlIndexModule
			if (!('getStaticProps' in module)) {
				ctx.scheduleTask(
					async () => {
						const Component = module.default
						const html = await compileComponent(<Component />)
						await writeBuiltPage(entry.mwTitle, html)
					},
					{ after: 'start', before: 'saveReferencedFiles' },
				)
				return
			}

			const ctxForGetStaticProps: GetStaticPropsContext = {
				createAssetUrl: (filePath) =>
					new Promise((resolve) => {
						const fileBaseName = path.basename(filePath, path.extname(filePath))
						const scriptEntryName = generateScriptEntryName(fileBaseName, entry.name)
						ctx.registerScriptEntry({
							type: 'asset',
							name: scriptEntryName,
							path: filePath,
							onBuildSuccess: resolve,
						})
					}),
			}
			ctx.scheduleTask(
				async () => {
					const props = await module.getStaticProps(ctxForGetStaticProps)
					const Component = module.default
					const html = await compileComponent(<Component {...props} />)
					await writeBuiltPage(entry.mwTitle, html)
				},
				{ after: 'start', before: 'saveReferencedFiles' },
			)
		},
		{ after: 'start', before: 'buildScriptEntries' },
	)
}
