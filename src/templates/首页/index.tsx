import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'

export default function MainPage() {
	return (
		<div className="preflight plainlinks mt-6 mb-15 space-y-10 leading-none">
			<BilibiliVideos />
			<ExternalSites />
		</div>
	)
}
