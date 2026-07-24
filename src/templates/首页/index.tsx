import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'
import { LatestArticles } from './latest-articles'
import { Topics } from './topics'

export default function MainPage() {
	return (
		<div className="preflight plainlinks mb-14 space-y-12 leading-none">
			<LatestArticles />
			<Topics />
			<BilibiliVideos />
			<ExternalSites />
		</div>
	)
}
