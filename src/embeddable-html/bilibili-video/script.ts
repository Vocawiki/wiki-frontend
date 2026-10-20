// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
// @ts-expect-error RLQ 也支持只传回调，但类型定义仅允许 [依赖, 回调] 元组
window.RLQ.push(['jquery'], async () => {
	const errMsg: Record<string, string> = {
		id: '此处填写的id有误，请参考<a href="/Template:BilibiliVideo#firstHeading" target="_blank">模板文档</a>修正……',
		error: '执行出现问题，请复制以下内容并在提问求助区处粘贴寻求帮助：$$$',
		attr: '下方填写的参数 $$$ 有误，请参考<a href="/Template:BilibiliVideo#firstHeading" target="_blank">模板文档</a>修正……',
	}
	await $.ready
	/** B 站 view 接口返回的 data 字段（仅声明实际用到的字段） */
	interface BilibiliViewData {
		title?: string
		pages: { cid?: number; page: number; part?: string }[]
	}
	/** B 站 view 接口的响应体（仅声明实际用到的字段） */
	interface BilibiliViewResponse {
		code: number
		message: string
		data: BilibiliViewData
	}
	const ifNamespaceAllow = [0, 4, 10, 12].includes(mw.config.get('wgNamespaceNumber'))
	const sanNode = $(`<span/>`)
	const genErr = (type: string, msg = '') =>
		Reflect.has(errMsg, type)
			? `<div style="font-style: italic; border: 1px dashed red;">BilibiliVideo模板：${errMsg[type]!.replace('$$$', sanNode.text(msg).html())}</div>`
			: ''
	const injectErrMsgBefore = ($ele: JQuery, type: string, msg = '') =>
		$ele.before(genErr(type, msg))
	const getErrorType = (code: number) => {
		switch (code) {
			case 62003: {
				return false
			}
			case -403: {
				return 'forbidden'
			}
			default: {
				return 'failed'
			}
		}
	}
	const idCorrector = (id: string) => {
		let type: string | false = false
		// 1. 有明确的 av 前缀且符合 aid 规则
		if (/^av[1-9]\d*$/iu.test(id)) {
			type = 'av'
		}
		// 2. 有明确的 bv 前缀且符合 bvid 规则
		else if (
			/^[bB][vV]1[FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf]{9}$/u.test(id)
		) {
			type = 'bv'
		}
		// 3. 没有明确的前缀，但符合 aid 规则
		else if (/^[1-9]\d*$/u.test(id)) {
			type = 'av'
		}
		// 4. 没有明确的前缀，但符合 bvid 规则且不符合 aid 规则
		else if (/^1?[FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf]{9}$/u.test(id)) {
			type = 'bv'
		}
		// 5. 无法判断

		if (type === 'av') {
			return {
				id: id.replace(/^av/iu, ''),
				prefix: {
					href: 'av',
					iframe: 'aid',
				},
			}
		}
		if (type === 'bv') {
			return {
				id: id.replace(
					/^.*([FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf]{9})$/iu,
					'1$1',
				),
				prefix: {
					href: 'BV',
					iframe: 'bvid',
				},
			}
		}
		return false
	}
	try {
		// oxlint-disable-next-line no-redeclare typescript/no-unnecessary-condition -- 沿用原实现的变量名与 isNaN 回退写法，不改动运行时行为
		const isNaN = Number.isNaN || window.isNaN
		const cssLengthUnitValidator = (
			length: string | undefined,
			defaultValue: string,
			callback: (isValidated: boolean) => void,
			paramName: string,
			$ele: JQuery,
		) => {
			if (typeof length !== 'string' || length.length === 0) {
				callback(false)
				return defaultValue
			}
			const parsedNumber = parseFloat(length.replace(/[a-z]+/iu, ''))
			if (isNaN(parsedNumber) || parsedNumber <= 0) {
				callback(false)
				injectErrMsgBefore($ele, 'attr', paramName)
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
			injectErrMsgBefore($ele, 'attr', paramName)
			return defaultValue
		}
		const fixedNumber = (number: number | string) => `${Number(number) < 10 ? '0' : ''}${number}`
		const secondsParser = (seconds: number | string) =>
			`${Math.floor(Number(seconds) / 60)}:${fixedNumber(Number(seconds) % 60)}`
		const submit = (ids: {
			failed: { aid: Set<string>; bvid: Set<string> }
			forbidden: { aid: Set<string>; bvid: Set<string> }
			pending: number
		}) => {
			if (!ifNamespaceAllow) {
				return
			}
			if (--ids.pending > 0) {
				return
			}
			let changed = false
			if (
				ids.failed.aid.size + ids.failed.bvid.size > 0 &&
				!mw.config.get('wgCategories').includes('带有失效视频的条目')
			) {
				changed = true
			}
			if (
				ids.forbidden.aid.size + ids.forbidden.bvid.size > 0 &&
				!mw.config.get('wgCategories').includes('带有受限视频的条目')
			) {
				changed = true
			}
			if (
				ids.failed.aid.size + ids.failed.bvid.size === 0 &&
				mw.config.get('wgCategories').includes('带有失效视频的条目')
			) {
				changed = true
			}
			if (
				ids.forbidden.aid.size + ids.forbidden.bvid.size === 0 &&
				mw.config.get('wgCategories').includes('带有受限视频的条目')
			) {
				changed = true
			}
			if (changed) {
				const url = new URL('https://moegirlpedia.annangela.cn/bilibiliCollector/videoCheck')
				url.searchParams.set('pageid', String(mw.config.get('wgArticleId')))
				$.get(`${url}`)
			}
		}
		const global_element = $('#mw-content-text')
		const placeholderToggle = (iframe: JQuery) => {
			if (iframe.data('displayFlag')) {
				iframe.data('displayFlag', false)
				const placeholder = iframe.data('placeholder') as JQuery
				placeholder.fadeOut(370)
			}
		}
		let lazyLoadObserver: IntersectionObserver | { observe: (target: HTMLIFrameElement) => void }
		if (
			Reflect.has(window, 'IntersectionObserver') &&
			Reflect.has(window, 'IntersectionObserverEntry') &&
			Reflect.has(window.IntersectionObserverEntry.prototype, 'intersectionRatio') &&
			Reflect.has(window.IntersectionObserverEntry.prototype, 'isIntersecting')
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
		const iframe_href_base =
			'https://player.bilibili.com/player.html?isOutside=true&playlist=true&playlist_order=sequential&musth5=1&noEndPanel=1&crossDomain=1&autoplay=0&'
		const EPSILON = 2.220446049250313e-16,
			rememberWH = (ele: JQuery) => {
				ele.data({ width: ele.width(), height: ele.height() })
			},
			setTureHeight = (ele: JQuery) => {
				const barHeight = ele.data('height') - (ele.data('width') * 9) / 16 // 计算标题和播放器控制栏高度
				ele.height((ele.width()! * 9) / 16 + barHeight)
			},
			setWH = (ele: JQuery) => {
				ele.css({ width: '100%', height: '100%' })
			},
			recallWH = (ele: JQuery) => {
				ele.width(ele.data('width') as number).height(ele.data('height') as number)
			},
			setMaxHeight = (container: JQuery, target: JQuery) => {
				const h = container.outerHeight(true)!
				let t = 0
				container.children().each((_, ele) => {
					t += $(ele).outerHeight(true)!
				})
				target.css(
					'max-height',
					`calc(100% - ${parseInt(String(t - h + 2 - (Number.EPSILON || EPSILON)), 10)}px)`,
				)
			}
		const run = () => {
			const ids = {
				failed: {
					aid: new Set<string>(),
					bvid: new Set<string>(),
				},
				forbidden: {
					aid: new Set<string>(),
					bvid: new Set<string>(),
				},
				pending: 0,
			}
			const targets = $('.bilibili-video-container:not(.exec)')
			ids.pending = targets.length
			targets.addClass('exec').each((_, ele) => {
				const { dataset } = ele
				// oxlint-disable-next-line no-underscore-dangle -- 变量名沿用原实现，避免与下方解构出的 id 重名
				const _id = dataset.id!
				const selfbox = $(ele)
				const toggleButton = selfbox.find('.bilibili-toggle')
				const widescreenButton = selfbox.find('.bilibili-widescreen')
				const validation = idCorrector(_id)
				if (!validation) {
					ele.outerHTML = genErr('id')
					return
				}
				const { id, prefix } = validation
				let page = parseInt(String(Number(dataset.page || 1)), 10)
				if (isNaN(page) || page < 1) {
					page = 1
					if (typeof dataset.page === 'string' && dataset.page !== '') {
						injectErrMsgBefore(selfbox, 'attr', 'page')
					}
				}
				const { pagename, title } = dataset
				const height = cssLengthUnitValidator(
					dataset.height,
					'441px',
					(isValidated) => isValidated || selfbox.removeAttr('data-height'),
					'height',
					selfbox,
				)
				const width = cssLengthUnitValidator(
					dataset.width,
					'665px',
					(isValidated) => isValidated || selfbox.removeAttr('data-width'),
					'width',
					selfbox,
				)
				const maxHeight = cssLengthUnitValidator(
					dataset.maxHeight,
					'100vh',
					(isValidated) => isValidated || selfbox.removeAttr('data-max-height'),
					'maxHeight',
					selfbox,
				)
				const maxWidth = cssLengthUnitValidator(
					dataset.maxWidth,
					'100%',
					(isValidated) => isValidated || selfbox.removeAttr('data-max-width'),
					'maxWidth',
					selfbox,
				)
				const subtitle = dataset.subtitle === 'true'
				// oxlint-disable-next-line radix -- t 为用户填写的原始字符串，保留原实现的默认基数解析
				const t = parseInt(dataset.t!)
				const tIsInvalid = isNaN(t) || t <= 0
				const iframeContainer = selfbox.find('.bilibili-iframe-container')
				const title_text = $('<a/>')
					.attr('rel', 'nofollow noreferrer noopener')
					.addClass('external text')
					.attr({
						href: `https://www.bilibili.com/video/${prefix.href}${id}?p=${page}${tIsInvalid ? '' : `&t=${t}`}`,
						target: '_blank',
					})
					.prependTo(selfbox.find('.bilibili-title'))
				const iframe = $('<iframe/>')
					.attr({
						allow: 'fullscreen',
						allowfullscreen: true,
						frameborder: 0,
						scrolling: 'no',
						src: '',
						class: 'bilibili-iframe',
					})
					.css({
						width,
						height,
						'max-width': maxWidth,
						'max-height': maxHeight,
					})
				if (!tIsInvalid) {
					selfbox.removeAttr('data-auto-expand')
				} else if (typeof dataset.t === 'string' && dataset.t !== '') {
					injectErrMsgBefore(selfbox, 'attr', 't')
				}
				const time = secondsParser(t)
				title_text.text(
					`${(title || prefix.href + id) + ([0, 1].includes(page) ? '' : ` (P${page})`) + (tIsInvalid ? '' : `[视频从${time}开始播放]`)}【视频信息加载中……】`,
				)
				iframeContainer.css({
					width,
					height,
					'max-width': maxWidth,
					'max-height': maxHeight,
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
				$.ajax({
					url: `https://api.bilibili.com/x/web-interface/view?${prefix.iframe}=${id}&jsonp=jsonp`,
					type: 'GET',
					dataType: 'jsonp',
					timeout: 10000,
					success: ({ code, message, data }: BilibiliViewResponse) => {
						if (code !== 0) {
							title_text.text(
								(title || prefix.href + id) +
									([0, 1].includes(page) ? '' : ` (P${page})`) +
									(tIsInvalid ? '' : `[视频从${time}开始播放]`),
							)
							iframe.attr(
								'data-src',
								`${iframe_href_base + prefix.iframe}=${id}&page=${page}${tIsInvalid ? '' : `&t=${t}`}`,
							)
							lazyLoadObserver.observe(iframe[0] as HTMLIFrameElement)
							console.info('Widget:BilibiliVideo', `${prefix.href}${id}`, code, message)
							const errorType = getErrorType(code)
							if (errorType) {
								ids[errorType][prefix.iframe as 'aid' | 'bvid'].add(id)
							}
							return
						}
						const list = data.pages
						// oxlint-disable-next-line no-underscore-dangle -- 变量名沿用原实现，与下方 index 计算对应
						let _page = 1
						const name = title || data.title || prefix.href + id
						let index: number
						let length: number
						if (pagename) {
							for (index = 0, length = list.length; index < length; index++) {
								if (list[index]!.part !== pagename) {
									continue
								}
								_page = list[index]!.page
								break
							}
						} else {
							_page = page
						}
						index = _page - 1
						const href = title_text.attr('href')
						// oxlint-disable-next-line typescript/prefer-optional-chain -- 保留原判断写法，避免数组项为 null 时行为发生变化
						if (list[index] !== undefined && list[index]!.cid !== undefined) {
							iframe.attr(
								'data-src',
								`${iframe_href_base}${prefix.iframe}=${id}&cid=${list[index]!.cid}&page=${_page}${tIsInvalid ? '' : `&t=${t}`}`,
							)
							title_text.attr(
								'href',
								href!.replace(new RegExp(`\\?p=${page}`, 'gu'), `?p=${_page}`),
							)
							title_text.text(
								`${name} [${_page}/${list.length}]${tIsInvalid ? '' : `[视频从${time}开始播放]`}`,
							)
							if (subtitle) {
								title_text.append(`<br>（${_page}、${list[index]!.part}）`)
							}
						} else {
							title_text.text(name + (tIsInvalid ? '' : `[视频从${time}开始播放]`))
							iframe.attr(
								'data-src',
								`${iframe_href_base + prefix.iframe}=${id}&page=${_page}${tIsInvalid ? '' : `&t=${t}`}`,
							)
						}
						lazyLoadObserver.observe(iframe[0] as HTMLIFrameElement)
					},
					error: () => {
						title_text.text(
							(title || prefix.href + id) +
								([0, 1].includes(page) ? '' : ` (P${page})`) +
								(tIsInvalid ? '' : `[视频从${time}开始播放]`),
						)
						iframe.attr(
							'data-src',
							`${iframe_href_base + prefix.iframe}=${id}&page=${page}${tIsInvalid ? '' : `&t=${t}`}`,
						)
						lazyLoadObserver.observe(iframe[0] as HTMLIFrameElement)
					},
					complete: () => {
						if (selfbox.is('[data-auto-expand="true"]')) {
							selfbox.addClass('onshow')
							iframeContainer.show()
							toggleButton.text('隐藏视频')
							selfbox.removeAttr('style')
						}
						submit(ids)
					},
				})
				// toggle
				toggleButton.on('click', () => {
					selfbox.width(iframeContainer.outerWidth(true)!)
					selfbox.toggleClass('onshow')
					iframeContainer.toggle()
					if (toggleButton.text() === '显示视频') {
						toggleButton.text('隐藏视频')
						// oxlint-disable-next-line typescript/no-deprecated -- 沿用原实现的 jQuery 简写方法，改为 .trigger 会改变行为细节
						$(window).resize()
					} else {
						toggleButton.text('显示视频')
						selfbox.removeAttr('style')
					}
				})
				widescreenButton.on('click', () => {
					if (selfbox.is(':not(.onshow)')) {
						return
					}
					if (selfbox.is('.widescreen')) {
						selfbox.removeClass('widescreen')
						widescreenButton.text('显示宽屏')
						recallWH(iframeContainer)
						recallWH(iframe)
						recallWH(selfbox)
					} else {
						selfbox.addClass('widescreen')
						widescreenButton.text('退出宽屏')
						rememberWH(selfbox)
						selfbox.css(
							'width',
							selfbox.parent().width()! > Math.min(911, global_element.width()!) ? '73%' : '100%',
						) // 可以看见按钮的最小宽度 665 的 1/0.73 倍
						setTureHeight(selfbox)
						rememberWH(iframe)
						rememberWH(iframeContainer)
						setWH(iframe)
						setWH(iframeContainer)
						iframeContainer.height(selfbox.height()! - title_text.parent().height()!)
						setMaxHeight(selfbox, iframeContainer)
					}
				})
			})
		}
		$(run)
		mw.hook('wikipage.content').add(run)
		$(window).on('load', run)
		$(window).on('resize', () => {
			$('.bilibili-video-container.onshow.widescreen').each((_, ele) => {
				const selfbox = $(ele)
				selfbox.css(
					'width',
					selfbox.parent().width()! > Math.min(911, global_element.width()!) ? '73%' : '100%',
				)
				setTureHeight(selfbox)
				setMaxHeight(selfbox, selfbox.find('.bilibili-iframe-container'))
			})
		})
	} catch (e) {
		const msg = genErr(
			'error',
			`${navigator.userAgent} : ${String(e)} ${String((e as Error).stack?.split('\n')[1]!.trim())}`,
		)
		$('.bilibili-video-container').each((_, ele) => {
			ele.outerHTML = msg
		})
	}
})
