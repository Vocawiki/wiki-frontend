import type { ResourceLoaderQueue } from '~/@types/rlq'
// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		try {
			const cssLengthUnitValidator = (
				length: string | undefined,
				defaultValue: string | undefined,
				callback: (isValidated: boolean) => void,
			) => {
				if (typeof length !== 'string' || length.length === 0) {
					callback(false)
					return defaultValue
				}
				const parsedNumber = parseFloat(length.replace(/[a-z]+/iu, ''))
				if (Number.isNaN(parsedNumber) || parsedNumber <= 0) {
					callback(false)
					return defaultValue
				}
				if (
					/^(?:\d+|\d*\.\d+)(?:em|ex|ch|rem|vw|vh|vmin|vmax|cm|mm|Q|in|pc|pt|px|%)$/u.test(length)
				) {
					callback(true)
					return length
				}
				if (/^(?:\d+|\d*\.\d+)$/u.test(length)) {
					callback(true)
					return `${length}px`
				}
				callback(false)
				return defaultValue
			}
			const placeholderToggle = (iframe: JQuery) => {
				if (iframe.data('displayFlag')) {
					iframe.data('displayFlag', false)
					const placeholder = iframe.data('placeholder') as JQuery
					placeholder.fadeOut(370)
				}
			}
			let lazyLoadObserver: IntersectionObserver | { observe: (target: HTMLIFrameElement) => void }
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
							;(lazyLoadObserver as IntersectionObserver).unobserve(target)
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
			const iframe_href_base = 'https://www.acfun.cn/player/'
			const run = () => {
				$('.acfun-video-container:not(.exec)')
					.addClass('exec')
					.each((_, ele) => {
						const dataset = ele.dataset,
							// oxlint-disable-next-line no-underscore-dangle -- 变量名沿用原实现，避免与下方解构/截取出的 id 重名
							_id = dataset.id!,
							id = _id.replace(/^ac/iu, ''),
							selfbox = $(ele)
						let prefix: { href: string; iframe: string }
						if (/^(?:ac)?\d{1,9}$/iu.test(_id)) {
							prefix = {
								href: 'ac',
								iframe: 'ac',
							}
						} else {
							ele.outerHTML = '<i>id错误</i>'
							return
						}
						let page = parseInt(String(Number(dataset.page || 1)), 10)
						if (Number.isNaN(page) || page < 1) {
							page = 1
						}
						const { title } = dataset
						const height = cssLengthUnitValidator(
							dataset.height,
							'441px',
							(isValidated) => isValidated || selfbox.removeAttr('data-height'),
						)
						const width = cssLengthUnitValidator(
							dataset.width,
							'665px',
							(isValidated) => isValidated || selfbox.removeAttr('data-width'),
						)
						const maxHeight = cssLengthUnitValidator(
							dataset.maxHeight,
							undefined,
							(isValidated) => {
								if (!isValidated) selfbox.removeAttr('data-max-height')
							},
						)
						const maxWidth = cssLengthUnitValidator(dataset.maxWidth, undefined, (isValidated) => {
							if (!isValidated) selfbox.removeAttr('data-max-width')
						})
						const iframeContainer = selfbox.find('.acfun-iframe-container')
						const title_text = $('<a/>')
							.attr('rel', 'nofollow noreferrer noopener')
							.addClass('external text')
							.attr({
								href: `https://www.acfun.cn/v/${prefix.href}${id}_${page}`,
								target: '_blank',
							})
							.prependTo(selfbox.find('.acfun-title'))
						const iframe = $('<iframe/>')
							.attr({
								frameborder: 0,
								scrolling: 'no',
								src: '',
								allowfullscreen: true,
								class: 'acfun-iframe',
							})
							.css({
								width: width!,
								height: height!,
								'max-width': maxWidth!,
								'max-height': maxHeight!,
							})
						iframeContainer.css({
							width: width!,
							height: height!,
							'max-width': maxWidth!,
							'max-height': maxHeight!,
						})
						iframe.appendTo(iframeContainer)
						const div = $('<div/>')
						div.css({
							position: 'absolute',
							top: '0',
							left: '0',
							bottom: '0',
							right: '0',
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
						div.append(text).appendTo(iframeContainer)
						iframe.data({
							placeholder: div,
							displayFlag: true,
						})
						iframe[0]!.addEventListener('load', () => {
							placeholderToggle(iframe)
						})
						title_text.text(
							(title || prefix.href + id) + ([0, 1].includes(page) ? ` (${page})` : ''),
						)
						iframe.attr('data-src', `${iframe_href_base + prefix.iframe}${id}`)
						lazyLoadObserver.observe(iframe[0]! as HTMLIFrameElement)
						// toggle
						selfbox.find('.acfun-toggle').on('click', (_, ele) => {
							const self = $(ele)
							selfbox.width(iframeContainer.outerWidth(true)!)
							selfbox.toggleClass('onshow')
							iframeContainer.toggle()
							if (self.text() === '显示视频') {
								self.text('隐藏视频')
								// oxlint-disable-next-line typescript/no-deprecated -- 沿用原实现的 jQuery 简写方法，改为 .trigger 会改变行为细节
								$(window).resize()
							} else {
								self.text('显示视频')
								selfbox.removeAttr('style')
							}
						})
					})
			}
			$(run)
			mw.hook('wikipage.content').add(run)
			$(window).on('load', run)
			setTimeout(() => {
				// oxlint-disable-next-line typescript/no-deprecated -- 沿用原实现的 jQuery 简写方法，改为 .trigger 会改变行为细节
				$('.acfun-video-container.exec[data-auto-expand="true"]').find('.acfun-toggle').click()
			}, 100)
		} catch (e) {
			// oxlint-disable-next-line no-alert -- 原模板以 prompt 提示错误，改为自定义 UI 会改变已上线的行为
			prompt(
				'AcfunVideo模板执行出现问题，请复制以下内容并在提问求助区处粘贴寻求帮助：',
				`${navigator.userAgent} : ${String(e)} ${String((e as Error).stack?.split('\n')[1]!.trim())}`,
			)
		}
	},
])
