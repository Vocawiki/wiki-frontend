import { emptyDir, outputJson } from 'fs-extra/esm'
import { noop } from 'radashi'
import type { IsEqual, Promisable } from 'type-fest'

import type { Expect } from '@/lib/typing'
import { saveReferencedFiles } from '@/tools/file-usage'

import { NONDEFAULT_CONTENT_MODELS_PATH, OUTPUT_DIR, PAGES_DIR_IN_OUTPUT_DIR } from '../config'
import { escapePageTitle } from '../utils/page'
import { buildJsEntries, type EntriesAdditionalInfo } from './compilers/js-compiler'
import {
	BuildContextForScheduler,
	type BuildStagesBase,
	type BuildContext as _BuildContext,
} from './lib/context'
import { Stage } from './lib/stage'

export const buildStages = {
	start: new Stage<undefined, void>(async () => {
		await emptyDir(OUTPUT_DIR)
	}),

	buildScriptEntries: new Stage<BuildContextForScheduler<BuildStagesBase>, undefined>(
		async (ctx) => {
			const entries = ctx.collectFinialScriptEntries()
			const input: Record<string, string> = {}
			const entriesAdditionalInfo = new Map() as EntriesAdditionalInfo
			const postBuildHandlers = new Map<string, (entryUrl: string) => Promisable<void>>()

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
		},
	),

	saveReferencedFiles: new Stage(saveReferencedFiles),

	saveNondefaultContentModels: new Stage<BuildContextForScheduler<BuildStagesBase>, void>(
		async (ctx) => {
			const titleToModelMap = ctx.collectFinialNondefaultContentModels()
			await outputJson(
				NONDEFAULT_CONTENT_MODELS_PATH,
				Object.fromEntries(titleToModelMap.entries()),
			)
		},
	),

	end: new Stage<undefined, undefined>(noop),
} satisfies BuildStagesBase

export const buildContext = new BuildContextForScheduler(buildStages)
export type BuildContext = _BuildContext<typeof buildStages>
