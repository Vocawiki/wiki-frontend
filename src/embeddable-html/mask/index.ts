/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Mask?action=history
 */
window.RLQ ??= []
window.RLQ.push([
	['jquery', 'mediawiki.Uri'],
	() => {
		$(() => {
			// oxlint-disable-next-line prefer-destructuring -- jQuery 集合并非真正的数组，可迭代性依赖 jQuery 版本，保留索引访问
			const root = $('#mw-content-text')[0]
			let propertyName = 'mask-image'
			// oxlint-disable-next-line typescript/no-unnecessary-condition -- 保留对旧环境的特性检测
			if (window.CSS && typeof CSS.supports === 'function') {
				if (CSS.supports('mask-image', 'none')) {
					propertyName = 'mask-image'
				} else if (CSS.supports('-webkit-mask-image', 'none')) {
					propertyName = '-webkit-mask-image'
				}
			}
			$('.applyMask').each((_, ele) => {
				try {
					const target = Array.from(
						root!.querySelectorAll(
							ele.dataset
								.target!.split(',')
								.map((s) => `:scope ${s.trim()}`)
								.join(', '),
						),
					)
					if (target.length === 0) {
						return
					}
					const { url } = ele.dataset
					// oxlint-disable-next-line typescript/no-deprecated -- mw.Uri 是 ResourceLoader 提供的模块，运行时依赖已上线验证
					if (!/^voca\.wiki$/u.test(new mw.Uri(url).host)) {
						return
					}
					$(target).css(propertyName, `url(${url!.replace(/^http:\/\//iu, 'https://')})`)
				} catch (e) {
					$(ele)
						.show()
						.text(`Mask模板发生错误：${String(e)} ${(e as Error).stack?.split('\n')[1]!.trim()}`)
				}
			})
		})
	},
])
