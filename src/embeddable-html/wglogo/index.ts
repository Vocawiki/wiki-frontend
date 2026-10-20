/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Wglogo?action=history
 */
window.RLQ ??= []
window.RLQ.push([
	'jquery',
	() => {
		const logoData = $('#wglogo')[0]!.dataset
		const logo = $('#p-logo a.mw-wiki-logo')
		const styleSheet: Record<string, string> = {
			'background-image': `url(${logoData.backgroundImage})`,
			'background-color': 'rgba(255,255,255,0.73)',
		}
		if (logoData.backgroundSize !== '' && logoData.backgroundSize !== 'false') {
			styleSheet['background-size'] = logoData.backgroundSize!
		}
		if (/-?\d+px -?\d+px/u.test(logoData.backgroundPosition || '')) {
			styleSheet['background-position'] = logoData.backgroundPosition!
		}
		logo.css(styleSheet)
	},
])
