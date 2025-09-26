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
interface PageItem {
	liElem: HTMLLIElement
	anchorElem: HTMLAnchorElement
	title: string
}

async function fetchPageImages(titles: string[]): Promise<PageImagesResult> {
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

function getPageItemsAndModifyDOM(): PageItem[] {
	const pageItems: PageItem[] = ([...document.querySelectorAll('.latest-article-list li')] as HTMLLIElement[])
		.map((liElem) => {
			const anchorElem: HTMLAnchorElement | null = liElem.querySelector('a[href^="/"]')
			return anchorElem?.title ? { liElem, anchorElem, title: anchorElem.textContent } : null
		})
		.filter((x) => x !== null)

	pageItems.forEach(({ anchorElem }) => {
		// 因为它需要一个单独的元素来使 CSS 的 text-overflow: ellipsis 生效
		anchorElem.innerHTML = `<div class="latest-article-title">${anchorElem.innerHTML}</div>`
	})

	// 添加“查看更多”按钮
	;[...document.querySelectorAll('.latest-article-list ol')].forEach((ol) => {
		ol.insertAdjacentHTML(
			'beforeend',
			`<li class="latest-article-list-view-more"><a href="${encodeURI('/Special:最新页面')}"><div class="latest-article-title">查看更多</div></a></li>`,
		)
	})

	return pageItems
}

async function applyPageImageOnDOM(pageItems: PageItem[]) {
	const pageImages = await fetchPageImages([...new Set(pageItems.map((x) => x.title))])

	pageItems.forEach(({ anchorElem, title }) => {
		const pageImage = pageImages[title]
		if (!pageImage) {
			return
		}
		anchorElem.insertAdjacentHTML(
			'afterbegin',
			// SB MW 不让用在 templatestyles 里用 -webkit-mask-image，只能写在这里。
			`<div class="latest-article-image" style="-webkit-mask-image: -webkit-linear-gradient(0deg, #fff 1em, transparent); mask-image: linear-gradient(90deg, #fff 1em, transparent);"><img src="${pageImage.source}" loading="lazy" alt=""></div>`,
		)
	})
}

// TODO: Bun 的打包器不会转换语法，等换打包器了改成 ??=
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
window.RLQ = window.RLQ || []
window.RLQ.push([['mediawiki.api'], () => applyPageImageOnDOM(getPageItemsAndModifyDOM())])
