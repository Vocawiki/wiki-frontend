import type { OutputOptions } from 'rolldown'

interface WidgetMetaBase {
	description?: string
}

export interface ScriptWidgetMeta extends WidgetMetaBase {
	type: 'script'
	scriptType: 'module' | 'classic'
	buildOptions?: OutputOptions
}

export interface ComponentWidgetMeta extends WidgetMetaBase {
	type: 'component'
}

export type WidgetMeta = ScriptWidgetMeta | ComponentWidgetMeta
