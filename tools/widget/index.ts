import type { OutputOptions } from 'rolldown'

export interface WidgetMeta {
	description?: string
	script: {
		type: 'module' | 'classic'
	}
	buildOptions?: OutputOptions
}
