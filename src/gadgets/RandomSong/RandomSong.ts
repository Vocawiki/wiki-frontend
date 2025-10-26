import { LocalCache } from './LocalCache'

interface CategoryData {
	title: string
	size: number
}

interface ResponseQuery {
	pages: {
		title: string
		categoryinfo: { pages: number }
	}[]
}

async function getCategoriesData(parentCategory: string): Promise<CategoryData[]> {
	const CACHE_KEY = `RandomSong-CatsData-${parentCategory}-v1`
	const CACHE_TTL = 86400 * 1000 // 缓存一天

	let data: CategoryData[] | null = LocalCache.get(CACHE_KEY)
	if (data !== null) return data

	const api = new mw.Api()
	const response = await api.get({
		action: 'query',
		generator: 'categorymembers',
		gcmtitle: `Category:${parentCategory}`,
		gcmtype: 'subcat',
		gcmlimit: 'max',
		prop: 'categoryinfo',
		format: 'json',
		formatversion: 2,
	})

	data = (response.query as ResponseQuery).pages.map((page) => ({
		title: page.title.substring(page.title.indexOf(':') + 1),
		size: page.categoryinfo.pages,
	}))
	LocalCache.set(CACHE_KEY, data, CACHE_TTL)
	return data
}

function selectCategory(categories: CategoryData[]): string {
	const totalWeight = categories.reduce((sum, cat) => sum + cat.size, 0)
	let random = Math.random() * totalWeight

	for (const cat of categories) {
		random -= cat.size
		if (random <= 0) {
			return cat.title
		}
	}

	// 理论上不会走到这里，但 TS 要求返回值
	return categories[0]!.title
}

async function main() {
	const newCategory = selectCategory(await getCategoriesData('按作者国籍分类的歌曲'))
	document.querySelector('#n-随机歌曲 a')?.setAttribute('href', encodeURI(`Special:RandomInCategory/${newCategory}`))
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => void main())
} else {
	void main()
}
