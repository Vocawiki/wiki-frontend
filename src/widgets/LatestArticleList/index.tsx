import { createRoot } from 'react-dom/client'

import { depend } from '~/snippets/rlq'

import { LatestArticleList } from './page-list'

interface RawLink {
	href: string
	title: string
}

function getRawLinks(): RawLink[] {
	const rawLinks: RawLink[] = Array.from(
		document.querySelectorAll<HTMLAnchorElement>('#latest-article-list li a'),
		(elem) => {
			return {
				href: elem.getAttribute('href')!,
				title: elem.title,
			}
		},
	)
	return rawLinks
}

function replaceDom() {
	const rawLinks = getRawLinks()
	if (rawLinks.length === 0) return

	const rootElem = document.getElementById('latest-article-list')
	if (!rootElem) {
		console.error('未找到ID为`latest-article-list`的元素')
		return
	}
	const root = createRoot(rootElem)
	root.render(<LatestArticleList pages={rawLinks} />)
}

depend('mediawiki.api', () => replaceDom())
