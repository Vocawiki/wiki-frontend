import type { Promisable } from 'type-fest'

import type { EntryMeta } from './compilers/js-compiler'

export interface ScriptBuildEntryMwPage {
	type: 'mw-page'
	title: string
	meta: EntryMeta
}

export interface ScriptBuildEntryAsset {
	type: 'asset'
	name: string
	path: string
	onBuildSuccess?: (entryUrl: string) => Promisable<void>
}

export type ScriptBuildEntry = ScriptBuildEntryMwPage | ScriptBuildEntryAsset
