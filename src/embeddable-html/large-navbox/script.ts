import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		$(() => {
			$('.navbox.largeNavbox:not(.largeNavboxExeced)').each((_, ele) => {
				const self = $(ele)
				self
					.addClass('largeNavboxExeced')
					.find('.navbox-title')
					.first()
					.prepend(`<span class="largeNavbox-toggle"></span>`)
				const button = self.find('.largeNavbox-toggle')
				button.append(`[<a>全隐/全显</a>]`)
				button.find('a').on('click', () => {
					const buttons = self.find('.navbox-list .mw-collapsible-toggle')
					if (buttons.filter('.mw-collapsible-toggle-collapsed').length * 2 > buttons.length) {
						// oxlint-disable-next-line typescript/no-deprecated -- 触发折叠控件的点击行为需与站内脚本一致
						buttons.filter('.mw-collapsible-toggle-collapsed').click()
					} else {
						// oxlint-disable-next-line typescript/no-deprecated -- 触发折叠控件的点击行为需与站内脚本一致
						buttons.filter(':not(.mw-collapsible-toggle-collapsed)').click()
					}
				})
			})
			$('.largeNavbox-toggle')
				.css({
					position: 'absolute',
					'user-select': 'none',
				})
				.find('a')
				.css('cursor', 'pointer')
		})
	},
])
