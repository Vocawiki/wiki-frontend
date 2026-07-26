import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'
import { HorizontalScrollablePageList } from '@/src/widgets/LatestArticleList/page-list'

import mockData from './mock-data'

export function LatestArticles() {
	return (
		<div>
			<h2 className="text-center">最新条目</h2>
			{SHOULD_CONVERT_WIKITEXT_TO_HTML ? <Preview /> : <Wikitext />}
		</div>
	)
}

function Wikitext() {
	return (
		<>
			{'{{#widget:LatestArticleList}}'}
			<div
				id="latest-article-list"
				className="preflight"
				dangerouslySetInnerHTML={{
					__html: `<DynamicPageList>
namespace = 0
notcategory = 消歧义页
notcategory = 软重定向
ordermethod = created
count = 30
mode = ordered
redirects = exclude
</DynamicPageList>`,
				}}
			></div>
		</>
	)
}

function Preview() {
	return (
		<div id="latest-article-list" className="preflight">
			<HorizontalScrollablePageList pages={mockData} />
		</div>
	)
}
