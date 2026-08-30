import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'
import { FlashTopic } from './flash-topic'
import { LatestArticles } from './latest-articles'
import { Topics } from './topics'

export default function MainPage() {
	return (
		<div className="plainlinks mb-14 space-y-12 leading-none">
			<FlashTopic />
			<LatestArticles />
			<Topics />
			<BilibiliVideos />
			<ExternalSites />
		</div>
	)
}
