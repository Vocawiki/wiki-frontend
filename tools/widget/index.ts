import type { RequiredDeep } from 'type-fest'

export interface WidgetMeta {
	description?: string
	script: {
		type: 'module' | null
		defer?: boolean
	}
	buildOptions?: Pick<Bun.NormalBuildConfig, 'minify'>
}

export const defaultWidgetMeta: RequiredDeep<WidgetMeta> = {
	description: '',
	script: {
		defer: false,
		type: null,
	},
	buildOptions: {
		minify: {
			whitespace: true,
			identifiers: true,
			syntax: true,
			keepNames: false,
		},
	},
}
