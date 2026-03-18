import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'
import { Topics } from './topics'

export default function MainPage() {
	return (
		<div className="space-y-12">
			<div className="preflight">
				<Topics />
			</div>
			{'{{{1|}}}'}
			<div className="preflight plainlinks mb-14 space-y-12 leading-none">
				<BilibiliVideos />
				<ExternalSites />
			</div>
		</div>
	)
}
