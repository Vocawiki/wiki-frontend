/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:NoReferer?action=history
 */

;(window.RLQ ??= []).push([
	['mediawiki.Uri', 'jquery'],
	() => {
		const domains = new Set(['hdslb.com'])
		$('.noRefererConfig').each((_, { dataset: { domain } }) => {
			for (const d of (domain || '').split('|')) {
				if (d) {
					domains.add(d)
				}
			}
		})
		const callback = (records: MutationRecord[]) => {
				for (const { target } of records) {
					if ((target as HTMLElement).dataset.lazyState === 'fail') {
						;(target as HTMLImageElement).src = (target as HTMLElement).dataset.lazySrc!
					}
				}
			},
			observer = new MutationObserver(callback)
		$('img').each((_, ele) => {
			const img = ele as HTMLImageElement
			// oxlint-disable-next-line typescript/no-deprecated -- mw.Uri 是 ResourceLoader 提供的模块，运行时依赖已上线验证
			const url = new mw.Uri(img.src || img.dataset.lazySrc)
			if ([...domains].some((domain) => url.host.includes(domain))) {
				img.setAttribute('referrerpolicy', 'no-referrer')
				url.protocol = 'https'
				url.query._ = String(Math.random())
				if (img.src || img.dataset.lazyState === 'fail') {
					img.src = url.toString()
				} else {
					img.dataset.lazySrc = url.toString()
					observer.observe(img, { attributes: true, attributeFilter: ['data-lazy-state'] })
				}
			}
		})
	},
])
