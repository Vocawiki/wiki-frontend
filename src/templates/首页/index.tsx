import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'

export default function MainPage() {
	return (
		<div className="preflight plainlinks mb-15 space-y-12 leading-none">
			<BilibiliVideos />
			<ExternalSites className="mb-8" />
		</div>
	)
}
