/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:TracklistSongLengthCalc?action=history
 */
;(window.RLQ ??= []).push([
	['mediawiki.base', 'jquery'],
	async () => {
		await $.ready
		for (const element of document.querySelectorAll('.tracklist')) {
			const target = element.querySelector('.total_length')
			if (!target) {
				continue
			}
			let total = 0
			for (const songElement of element.querySelectorAll('.song_length')) {
				const text = songElement.textContent.trim()
				const match = text.match(/(\d+):(\d+)/u)
				if (!match) {
					continue
				}
				const [, minutes, seconds] = match
				total += Number(minutes) * 60 + Number(seconds)
			}
			const min = Math.floor(total / 60)
			const sec = (total % 60).toString().padStart(2, '0')
			target.textContent = `${min}:${sec}`
		}
	},
])
