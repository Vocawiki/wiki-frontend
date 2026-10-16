import assert from 'node:assert/strict'
import fs from 'node:fs/promises'

import { emptyDir } from 'fs-extra/esm'
import PQueue from 'p-queue'
import type { IsEqual } from 'type-fest'

import type { Expect } from '@/lib/typing'
import { saveReferencedFiles } from '@/tools/file-usage'

import { NONDEFAULT_CONTENT_MODELS_PATH, OUTPUT_DIR, PAGES_DIR_IN_OUTPUT_DIR } from '../config'
import type { ContentModel } from '../types'
import { escapePageTitle } from '../utils/page'
import { buildJsEntries, type EntriesAdditionalInfo } from './compilers/js-compiler'
import { buildEmbeddableHtmlSnippets } from './embeddable-html'
import { buildGadgets } from './gadget'
import type { ScriptBuildEntry } from './types'
import { buildWikitextPages } from './wikitext'

await emptyDir(OUTPUT_DIR)
const queue = new PQueue()

const scriptEntries: ScriptBuildEntry[] = []
const nondefaultContentModels = new Map<string, ContentModel>()
const mwPageNames = new Set<string>()
const assetNames = new Set<string>()

const addToScriptEntries = (entry: ScriptBuildEntry) => {
	if (entry.type === 'mw-page') {
		const title = entry.title
		assert(!mwPageNames.has(title), `出现了重名的MediaWiki页面：${title}`)
	} else {
		type _Check = Expect<IsEqual<typeof entry.type, 'asset'>>
		const name = entry.name
		assert(!assetNames.has(name), `出现了重名的asset：${name}`)
	}
	scriptEntries.push(entry)
}

void queue.add(() => buildGadgets({ queue, onScriptEntryFound: addToScriptEntries }))
void queue.add(() =>
	buildEmbeddableHtmlSnippets({
		onScriptEntryFound: addToScriptEntries,
		onNondefaultContentModelFound: (title, contentModel) => {
			nondefaultContentModels.set(title, contentModel)
		},
	}),
)
void queue.add(() => buildWikitextPages())

await Promise.race([queue.onError(), queue.onIdle()])
queue.pause() // Stop processing remaining tasks
queue.addEventListener('add', () => {
	throw new Error('不应有新的任务追加')
})

await Promise.all([
	saveReferencedFiles(),
	buildScripts(scriptEntries),
	saveNondefaultContentModels(nondefaultContentModels),
])

async function buildScripts(entries: ScriptBuildEntry[]) {
	const input: Record<string, string> = {}
	const entriesAdditionalInfo = new Map() as EntriesAdditionalInfo
	const postBuildHandlers = new Map<string, (entryUrl: string) => Promise<void>>()

	entries.forEach((entry) => {
		if (entry.type === 'asset') {
			const rolldownEntryName = entry.name
			input[rolldownEntryName] = entry.path
			if (entry.onBuildSuccess) {
				postBuildHandlers.set(entry.name, entry.onBuildSuccess)
			}
			return
		}
		type _Check = Expect<IsEqual<typeof entry.type, 'mw-page'>>

		const rolldownEntryName = `${PAGES_DIR_IN_OUTPUT_DIR}/${escapePageTitle(entry.title)}.txt`
		input[rolldownEntryName] = entry.meta.path
		entriesAdditionalInfo.set(rolldownEntryName, entry.meta)
	})

	console.log('准备使用Rolldown构建：', input)
	await buildJsEntries(input, {
		entriesAdditionalInfo,
		postBuildHandlers,
	})
}

async function saveNondefaultContentModels(titleToModelMap: Map<string, ContentModel>) {
	const content = JSON.stringify(Object.fromEntries(titleToModelMap.entries()))
	await fs.writeFile(NONDEFAULT_CONTENT_MODELS_PATH, content, 'utf-8')
}
