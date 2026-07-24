export interface PageInfoBase {
	title: string
	href: string
}

export interface PageAdditionalInfo {
	image: {
		source: string
		width: number
		height: number
	} | null
	/** 可能是空字符串 */
	summary: string
}

export type PageInfo = PageInfoBase & PageAdditionalInfo
export type PartialPageInfo = PageInfoBase & Partial<PageAdditionalInfo>
