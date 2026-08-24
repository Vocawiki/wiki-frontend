export interface Chip {
	value: string
	label?: string
	disambig?: boolean
}

export interface LicenseField {
	key: string
	label: string
	type: 'text' | 'select'
	placeholder?: string
	required?: boolean
	options?: string[]
	def?: string
}

export interface LicenseOption {
	tpl: string
	label: string
	fields: LicenseField[]
	build?: (v: Record<string, string>) => string
	missing?: boolean
}

export interface LicenseGroup {
	group: string
	options: LicenseOption[]
}

export interface QueryRedirect {
	from: string
	to: string
}

export interface QueryPage {
	title: string
	missing?: boolean
	imageinfo?: { thumburl?: string }[]
	categoryinfo?: { subcats?: number }
	categories?: { title: string }[]
}

export interface ApiQueryResponse {
	query?: {
		pages?: QueryPage[]
		redirects?: QueryRedirect[]
		categorymembers?: { title: string }[]
		prefixsearch?: { title: string }[]
	}
	continue?: { cmcontinue?: string }
}

export interface ApiParseResponse {
	parse?: { text?: string }
}

export interface UploadResponse {
	upload?: {
		result?: string
		warnings?: Record<string, string>
	}
	errors?: { '*'?: string }[]
	error?: { info?: string }
}
