import type { OutputOptions } from 'rolldown'

export interface WidgetMeta {
	description?: string
	script: {
		type: 'module' | null
	}
	buildOptions?: Partial<Pick<OutputOptions, 'minify'>>
}
