import type { ResourceLoaderQueue } from '~/@types/rlq'
// oxlint-disable max-lines-per-function max-statements -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	['ext.gadget.libOOUIDialog'],
	() => {
		try {
			const types = ['playlist', 'album', 'song', 'program', 'djradio']
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
				// oxlint-disable-next-line complexity -- 逐项校验模板参数并渲染播放器，拆分会改变变量作用域与执行顺序
				$('.music163:not(.exec)').each((_, that) => {
					const self = $(that)
					self.addClass('exec')
					const id = that.dataset.id
					const size: string = that.dataset.size === 'small' ? 'small' : 'big'
					const title = that.dataset.title
					let type = that.dataset.type
					let float = that.dataset.float
					let align = that.dataset.align
					let width = parseInt(that.dataset.width!, 10)
					let height = parseInt(that.dataset.height!, 10)
					let height_type: number
					// 检测ID是否合法（纯数字），不合法则抛出异常。
					if (!/^\d+$/u.test(id || '')) {
						self.css('color', 'red').text('Error in widget:Music163: Invalid id.')
						return
					}
					// 检测宽度是否合法（纯数字、260 < width < 510），不合法则使用默认值。
					if (isNaN(width) || width < 260 || width > 510) {
						width = size === 'small' ? 278 : 310
					}
					// 检测类型是否合法（在类型表内），合法则替换为类型下标，不合法则使用默认值。
					if (types.includes(type!)) {
						type = String(types.indexOf(type!))
					} else if (!/^\d+$/u.test(type || '') || !types[Number(type!)]) {
						type = '2'
					}
					that.dataset.type = type
					// 检测浮动类型是否合法，若不为left或right则设定为none
					if (['center', 'right'].includes(align || '')) {
						float = 'none'
					} else {
						align = 'none'
						if (!['left', 'right'].includes(float || '')) {
							float = 'none'
						}
					}
					// 检测高度是否合法：
					// 1、如果是单曲类，高度为固定值，高度类型为固定值减去20；
					if (['2', '3'].includes(type!)) {
						height = size === 'small' ? 52 : 86
						height_type = height - 20
					}
					// 2、如果是列表类，小播放器的高度为固定值，高度类型为固定值减去20；
					else if (size === 'small') {
						height = 110
						height_type = height - 20
					}
					// 3、大播放器的高度如果不合法则使用默认值，高度类型为默认值减去20；
					else if (isNaN(width) || width < 210 || width > 520) {
						height = size === 'small' ? 110 : 450
						height_type = height - 20
					}
					// 4、如果合法则高度类型为固定值。
					else {
						height_type = 430
					}
					if (align !== 'none') {
						self.addClass(`align-${align}`)
					}
					if (float !== 'none') {
						self.addClass(`float-${float}`)
					}
					self
						.empty()
						.append(
							`<div class="subinfo"><a rel="nofollow noreferrer noopener" class="external text" href="https://music.163.com/#/${types[Number(type!)]}?id=${id}" target="_blank"><img src="https://s1.music.126.net/music.ico"></a><br>[<a href="javascript:void(0);" class="music163CopyrightNotice">版权提示</a>]</div>`,
						)
						.attr('title', `${title || that.title || `id ${id}`} - 网易云音乐`)
					const iframe = $('<iframe/>')
					iframe.attr(
						'sandbox',
						'allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation',
					)
					iframe.attr(
						'data-src',
						`//music.163.com/outchain/player?type=${type}&id=${id}&auto=0&height=${height_type}`,
					)
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
					self.find('.music163CopyrightNotice').on('click', () => {
						oouiDialog.alert(
							'网易云音乐限制了部分版权音乐的站外播放功能，如果您发现播放器无法显示或播放歌曲，则说明该歌曲被限制站外播放。<br>此时我们建议点击播放器右侧网易云音乐图标，跳转到歌曲页面欣赏。',
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
					.text('Music163模板执行出现问题，请复制以下内容并在提问求助区处粘贴寻求帮助：')
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
