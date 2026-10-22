import type { ResourceLoaderQueue } from '~/@types/rlq'
// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	['ext.gadget.libOOUIDialog', 'mediawiki.Uri'],
	() => {
		try {
			const placeholderToggle = (iframe: JQuery) => {
				if (iframe.data('displayFlag')) {
					iframe.data('displayFlag', false)
					const placeholder = iframe.data('placeholder') as JQuery
					placeholder.fadeOut(370)
				}
			}
			let lazyLoadObserver:
				| IntersectionObserver
				| {
						observe: (target: HTMLIFrameElement) => void
						unobserve?: (target: HTMLIFrameElement) => void
				  }
			if (
				'IntersectionObserver' in window &&
				'IntersectionObserverEntry' in window &&
				'intersectionRatio' in window.IntersectionObserverEntry.prototype &&
				'isIntersecting' in window.IntersectionObserverEntry.prototype
			) {
				lazyLoadObserver = new IntersectionObserver((entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const target = entry.target as HTMLIFrameElement
							target.src = target.dataset.src!
							setTimeout(() => {
								placeholderToggle($(target))
							}, 13070)
							lazyLoadObserver.unobserve?.(target)
						}
					})
				})
			} else {
				lazyLoadObserver = {
					observe: (target: HTMLIFrameElement) => {
						target.src = target.dataset.src!
						setTimeout(() => {
							placeholderToggle($(target))
						}, 13070)
					},
				}
			}
			const run = () => {
				$('.appleMusic:not(.exec)').each((_, that) => {
					const self = $(that)
					self.addClass('exec')
					const id = that.dataset.id
					const area = that.dataset.area
					const song = that.dataset.song
					const title = that.dataset.title
					let float = that.dataset.float
					const width = 660
					const height = /^\d+$/u.test(song || '') ? 150 : 450
					if (!/^\d+$/u.test(id || '')) {
						self.css('color', 'red').text('Error in widget:AppleMusic: Invalid id.')
						return
					}
					if (!['left', 'right'].includes(float || '')) {
						float = 'none'
					}
					if (float !== 'none') {
						self.addClass(`float-${float}`)
					}
					self
						.empty()
						.attr(
							'title',
							`${title || that.title || `id ${id}${/^\d+$/u.test(id!) ? ` song ${song}` : ''}`} - Apple Music`,
						)
						.append(
							`<div class="subinfo"><a rel="nofollow noreferrer noopener" class="external text" href="https://music.apple.com/${area}/album/${id}${/^\d+$/u.test(song || '') ? `?i=${song}` : ''}" target="_blank"><img src="https://music.apple.com/assets/favicon/favicon-32.png"></a><br>[<a href="javascript:void(0);" class="appleMusicCopyrightNotice">会员提示</a>]</div>`,
						)
					const iframe = $('<iframe/>')
					iframe.attr({
						allow: 'encrypted-media; clipboard-write',
						'data-src': `https://embed.music.apple.com/${area}/album/${id}${/^\d+$/u.test(song || '') ? `?i=${song}` : ''}`,
					})
					iframe.width(width).height(height)
					const div = $('<div/>')
					div.width(width).height(height).css({
						position: 'absolute',
						top: '0',
						left: '0',
						'z-index': '99',
						display: 'flex',
						'align-items': 'center',
						background: 'rgba(255, 255, 255, .37)',
					})
					const text = $('<div/>')
					text
						.css({
							'text-align': 'center',
							width: '100%',
						})
						.text('正在加载中，若长时间空白则说明是网络问题……')
					div.append(text).appendTo(self)
					iframe.data({
						placeholder: div,
						displayFlag: true,
					})
					self.prepend(iframe)
					iframe[0]!.addEventListener('load', () => {
						placeholderToggle(iframe)
					})
					self.find('.appleMusicCopyrightNotice').on('click', () => {
						oouiDialog.alert(
							'Apple Music 限制了未订阅 Apple Music 用户的站外音乐播放功能，如果您未在 Apple Music 网站登录订阅了 Apple Music 的账户，则只能播放随机30秒片段。<br>此时我们建议点击播放器右侧 Apple Music 图标，跳转到歌曲页面欣赏。',
						)
					})
					lazyLoadObserver.observe(iframe[0] as HTMLIFrameElement)
				})
			}
			$(run)
			mw.hook('wikipage.content').add(run)
			$(window).on('load', run)
		} catch (e) {
			oouiDialog.alert(
				$('<div>')
					.text('AppleMusic模板执行出现问题，请复制以下内容并在提问求助区处粘贴寻求帮助：')
					.append(
						$('<pre>').text(
							`wgPageName: ${mw.config.get('wgPageName')}\nwgArticleId: ${mw.config.get('wgArticleId')}\nwgRevisionId: ${mw.config.get('wgRevisionId')}\n----\nUser Agent: ${navigator.userAgent}\n----\n${e as string}\n${(e as Error).stack?.split('\n')[1]!.trim()}`,
						),
					),
				{
					size: 'medium',
				},
			)
		}
	},
])
