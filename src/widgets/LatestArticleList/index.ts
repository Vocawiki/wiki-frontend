/**
 * @file 供{{tl|首页/最新条目}}使用。
 */

interface PageImagesResult {
	[title: string]: {
		source: string
		width: number
		height: number
	}
}
async function getPageImages(titles: string[]): Promise<PageImagesResult> {
	if (titles.length === 0) return {}

	const api = new mw.Api()
	const data = (await api.get({
		action: 'query',
		format: 'json',
		formatversion: '2',
		prop: 'pageimages',
		pithumbsize: 128,
		piprop: 'thumbnail',
		pilicense: 'any',
		titles: titles,
	})) as unknown as {
		query: {
			batchcomplete: boolean
			pages: {
				pageid: number
				ns: number
				title: string
				thumbnail?: {
					source: string
					width: number
					height: number
				}
			}[]
		}
	}
	const result = Object.fromEntries(data.query.pages.filter((x) => x.thumbnail).map((x) => [x.title, x.thumbnail!]))
	return result
}

async function applyPageImageOnDOM() {
	const items = ([...document.querySelectorAll('.latest-article-list li')] as HTMLLIElement[])
		.map((liElem) => {
			const anchorElem = liElem.querySelector('a')
			return anchorElem?.title ? { liElem, anchorElem, title: anchorElem.title } : null
		})
		.filter((x) => x !== null)
	const pageImages = await getPageImages([...new Set(items.map((x) => x.title))])
	for (const { anchorElem, title } of items) {
		if (!pageImages[title]) continue
		const { source } = pageImages[title]
		anchorElem.insertAdjacentHTML('afterbegin', `<div class="latest-article-image"><img src="${source}" alt=""></div>`)
	}
}

void applyPageImageOnDOM()
