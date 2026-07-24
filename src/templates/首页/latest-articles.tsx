export function LatestArticles() {
	return (
		<div>
			<h2 className="text-center">最新条目</h2>
			{'{{#widget:LatestArticleList}}'}
			<div id="latest-article-list">{`<DynamicPageList>
namespace = 0
notcategory = 消歧义页
notcategory = 软重定向
ordermethod = created
count = 30
mode = ordered
redirects = exclude
</DynamicPageList>`}</div>
		</div>
	)
}
