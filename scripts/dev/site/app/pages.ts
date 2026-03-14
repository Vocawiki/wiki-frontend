import { globby } from 'globby'

export interface PageToPreview {
	namespace: 'Template'
	pageName: string
	fullPageName: string
}

const entries = await globby('src/templates/*', { onlyDirectories: true, objectMode: true })
const pageList = entries.map((entry): PageToPreview => {
	const namespace = 'Template'
	const pageName = entry.name
	return {
		namespace,
		pageName,
		fullPageName: namespace + ':' + pageName,
	}
})

export const pages = new Map<string, PageToPreview>(pageList.map((p) => [p.fullPageName, p]))
