import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'
import { PageList } from '@/src/widgets/LatestArticleList/page-list'

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
				className="preflight ignore-article-max-width"
				style={{
					WebkitMaskImage:
						'-webkit-linear-gradient(left, transparent, black calc(50cqw - var(--width-layout) / 2), black calc(50cqw + var(--width-layout) / 2), transparent)',
					maskImage:
						'linear-gradient(to right, transparent, black calc(50cqw - var(--width-layout) / 2), black calc(50cqw + var(--width-layout) / 2), transparent)',
				}}
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
		<div
			id="latest-article-list"
			className="preflight ignore-article-max-width"
			style={{
				WebkitMaskImage:
					'-webkit-linear-gradient(left, transparent, black calc(50cqw - var(--width-layout) / 2), black calc(50cqw + var(--width-layout) / 2), transparent)',
				maskImage:
					'linear-gradient(to right, transparent, black calc(50cqw - var(--width-layout) / 2), black calc(50cqw + var(--width-layout) / 2), transparent)',
			}}
		>
			<PageList
				pages={mockData}
				className="mx-auto max-w-480 px-[calc((100%-var(--width-layout))/2)]"
			/>
		</div>
	)
}
