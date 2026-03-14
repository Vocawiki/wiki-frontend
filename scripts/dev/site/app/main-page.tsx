import { pages } from './pages'
import { SiteMain } from './site-main'

export function MainPage() {
	return (
		<SiteMain title="测试喵">
			<p>查看：</p>
			<ul>
				{[...pages.values()].map(({ fullPageName, pageName }) => {
					return (
						<li key={fullPageName}>
							<a href={`/${fullPageName}`}>{pageName}</a>
						</li>
					)
				})}
			</ul>
		</SiteMain>
	)
}
