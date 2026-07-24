export function LatestArticles() {
	return (
		<div>
			<h2 className="text-center">最新条目</h2>
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
			>
				{/* @ts-expect-error MW标签 */}
				<dynamicpagelist>
					{`
namespace = 0
notcategory = 消歧义页
notcategory = 软重定向
ordermethod = created
count = 30
mode = ordered
redirects = exclude
`}
					{/* @ts-expect-error MW标签 */}
				</dynamicpagelist>
			</div>
		</div>
	)
}
