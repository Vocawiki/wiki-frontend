import assert from 'node:assert/strict'

import { emptyDir } from 'fs-extra/esm'
import PQueue from 'p-queue'

import { saveReferencedFiles } from '@/tools/file-usage'

import { OUTPUT_DIR, PAGES_DIR_IN_OUTPUT_DIR } from '../config'
import { escapePageTitle } from '../utils/page'
import { buildJsEntries, type EntriesAdditionalInfo } from './compilers/js-compiler'
import { buildGadgets } from './gadget'
import type { ScriptBuildEntry } from './types'
import { buildWidgets } from './widget'
import { buildWikitextPages } from './wikitext'

await emptyDir(OUTPUT_DIR)
const queue = new PQueue()

const scriptEntries: ScriptBuildEntry[] = []
const mwPageNames = new Set<string>()
const assetNames = new Set<string>()

const addToScriptEntries = (entry: ScriptBuildEntry) => {
	if (entry.type === 'mw-page') {
		const title = entry.title
		assert(!mwPageNames.has(title), `出现了重名的MediaWiki页面：${title}`)
	} else if (entry.type === 'asset') {
		const name = entry.name
		assert(!assetNames.has(name), `出现了重名的asset：${name}`)
	} else {
		throw new Error('未知分支')
	}
	scriptEntries.push(entry)
}

void queue.add(() => buildGadgets({ queue, onScriptEntryFound: addToScriptEntries }))
void queue.add(() => buildWidgets({ onScriptEntryFound: addToScriptEntries }))
void queue.add(() => buildWikitextPages())

await Promise.race([queue.onError(), queue.onIdle()])
queue.pause() // Stop processing remaining tasks
queue.on('add', () => {
	throw new Error('不应有新的任务追加')
})

await Promise.all([saveReferencedFiles(), buildScripts(scriptEntries)])

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
		if (entry.type === 'mw-page') {
			const rolldownEntryName = `${PAGES_DIR_IN_OUTPUT_DIR}/${escapePageTitle(entry.title)}.txt`
			input[rolldownEntryName] = entry.meta.path
			entriesAdditionalInfo.set(rolldownEntryName, entry.meta)
			return
		}
		throw new Error('未实现的构建目标')
	})

	console.log('准备使用Rolldown构建：', input)
	await buildJsEntries(input, {
		entriesAdditionalInfo,
		postBuildHandlers,
	})
}
