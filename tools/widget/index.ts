export interface WidgetMeta {
	description?: string
	script: {
		type: 'module' | null
		defer: boolean
	}
}
