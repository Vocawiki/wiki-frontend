export interface WidgetMeta {
	description?: string
	script?: {
		attributes?: {
			type?: 'module' | null
		} & {
			[name: string]: string | boolean | null
		}
	}
}
