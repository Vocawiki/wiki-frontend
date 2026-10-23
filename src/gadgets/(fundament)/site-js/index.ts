import { cleanLocalStorage } from './clean-localstorage'
import { modifyLayout } from './layout'
import { polyfillRandomUUID } from './polyfill-random-uuid'
import { hookRandomSongLinkClick } from './random-song'

declare global {
	var oouiDialog: {
		alert: (...args: readonly unknown[]) => void
		sanitize: (str: string) => string
	}

	interface Window {
		_TODO_REMOVE_THIS_LOGIC_vocawikiCommonJsExecuted?: true
	}
}

void (async () => {
	// oxlint-disable-next-line no-underscore-dangle
	if (window._TODO_REMOVE_THIS_LOGIC_vocawikiCommonJsExecuted) return
	// oxlint-disable-next-line no-underscore-dangle
	window._TODO_REMOVE_THIS_LOGIC_vocawikiCommonJsExecuted = true

	/* 函数定义体 */
	const { wgUserGroups, wgServer, wgScriptPath, wgPageName, wgAction, wgNamespaceNumber } =
		mw.config.get()
	/* 以下为允许添加版权声明的命名空间列表 */
	const copyRightsNameSpaces = [
		0, // （主）
		4, // Vocawiki
		8, // MediaWiki
		10, // Template
		12, // Help
		274, // Widget
		828, // Module
	]
	/* 检查是否为管理员 */
	const allowedInGroup = wgUserGroups?.includes('sysop')

	// 页顶公告自动滚动
	function startScroll() {
		$('#siteNotice .scrollDiv:not(.scrolling)')
			.addClass('scrolling')
			.each((_, ele) => {
				const self = $(ele)
				self.children().each((_, child) => {
					if (child.innerHTML.trim() === '') {
						child.remove()
					}
				})
				const children = self.children()
				if (children.length === 0) {
					return
				}
				const firstChild = children.first()
				const firstChildHeight = firstChild.outerHeight()!
				self.height(firstChildHeight)
				children.slice(1).css('top', `${Math.ceil(firstChildHeight)}px`)
				firstChild.css('top', '0')
			})
	}
	function autoScroll() {
		setInterval(() => {
			if (!document.hidden) {
				$('#siteNotice .scrollDiv.scrolling').each((_, ele) => {
					const self = $(ele)
					if (self.css('font-weight') === '700') {
						return
					}
					const children = self.children()
					const all = self.add(children)
					if (children.length === 1) {
						return
					}
					const firstChild = children.first()
					const firstChildHeight = firstChild.outerHeight()!
					const secondChild = firstChild.next()
					const secondChildHeight = secondChild.outerHeight()!
					const otherChild = children.slice(2)
					let maxHeight = Math.max(firstChildHeight, secondChildHeight)
					otherChild.each((_, child) => {
						maxHeight = Math.max(maxHeight, $(child).outerHeight()!)
					})
					all.addClass('animation')
					self.height(maxHeight)
					firstChild.css('top', `-${firstChildHeight}px`)
					secondChild.css('top', `${(maxHeight - secondChildHeight) / 2}px`)
					otherChild.css('top', `${Math.ceil(maxHeight)}px`)
					setTimeout(() => {
						all.removeClass('animation')
						firstChild.appendTo(self).css('top', Math.ceil(maxHeight))
					}, 400)
				})
			}
		}, 5000)
	}

	// 跨站重定向页顶链接
	const crossDomainLink = (url: URL) => {
		const link = url.searchParams.get('title')
		const domain = url.host
		const crossDomain = $('<div/>')
		const anchor = $('<a/>')
		crossDomain.text('＜')
		anchor.attr('href', `${url}`).text(`${link} 【来自 ${domain} 的跨站重定向】`)
		crossDomain.append(anchor)
		$('#contentSub').prepend(crossDomain)
	}

	// 复制修改内容
	const copyRights = async () => {
		await mw.loader.using('mediawiki.util')
		const div = $('<div>', {
				class: 'visually-hidden',
				html: `<pre></pre><br>\n阅读更多：${/%/u.test(mw.util.wikiUrlencode(wgPageName)) ? `${wgPageName}（${wgServer}${wgScriptPath}/${encodeURIComponent(wgPageName)} ）` : `${wgServer}${wgScriptPath}/${wgPageName}`}<br>\n本文引自Vocawiki（${wgServer.replace(/^\/\//u, 'https://')}），文字内容默认使用《知识共享 署名—非商业性使用—相同方式共享 4.0 国际》协议。`,
			}).appendTo('body'),
			valueNode = div.find('pre')
		$('#mw-content-text').on('copy', () => {
			const selection = window.getSelection()
			if (!selection) return
			const value = selection.toString()
			const range = selection.getRangeAt(0)

			// 当复制内容长度小于定值时不添加声明
			if (value.length < 128) return
			// wikiplus特别处理
			const wikiplusBox = document.querySelector('.Wikiplus-InterBox')
			if (wikiplusBox && selection.containsNode(wikiplusBox, true)) {
				return
			}

			valueNode.text(value)
			selection.selectAllChildren(div[0]!)
			window.setTimeout(() => {
				// 以下将还原选区
				selection.removeAllRanges()
				selection.addRange(range)
				valueNode.empty()
			}, 0)
		})
	}

	// 跨站重定向页顶链接
	const crossDomainDetect = () => {
		const redirectFrom = new URLSearchParams(window.location.search).get('rdfrom')
		if (!redirectFrom) return

		try {
			const redirectFromUrl = new URL(redirectFrom)
			const search = redirectFromUrl.searchParams
			if (search.get('title') && search.get('redirect') === 'no') {
				crossDomainLink(redirectFromUrl)
			}
		} catch {
			// ignore
		}
	}

	// 修正hash跳转错误
	const hashJump = async () => {
		await mw.loader.using(['jquery.makeCollapsible'])
		$('.mw-collapsible').makeCollapsible()
		const { hash } = location
		location.hash = ''
		location.hash = hash
	}

	/* 函数执行体 */
	await $.ready
	// 页顶公告自动滚动
	startScroll()
	autoScroll()

	// 复制内容版权声明
	if (
		!allowedInGroup &&
		!['edit', 'submit'].includes(wgAction) &&
		copyRightsNameSpaces.includes(wgNamespaceNumber)
	) {
		void copyRights()
	}

	// 修正hash跳转错误
	if ($('.mw-collapsible')[0] && location.hash !== '') {
		void hashJump()
	}
	// 跨站重定向页顶链接
	crossDomainDetect()
	// 禁止移动被挂删的页面
	if (!allowedInGroup && $('.regToDel')[0]) {
		$('#ca-move').remove()
	}
})()

/* 为不安全上下文提供`crypto.randomUUID()`（目前被几个Widget使用） */
polyfillRandomUUID()

const { wgCanonicalSpecialPageName, wgAction } = mw.config.get([
	'wgCanonicalSpecialPageName',
	'wgAction',
])

const $window = $(window)

/* T:注解 */
$('.annotation').each((_, ele) => {
	const popup = new OO.ui.PopupWidget({
		$content: $(ele).children('.annotation-content'),
		padded: true,
		autoFlip: false,
	})
	$(ele)
		.append(popup.$element)
		.on('mouseover', () => {
			popup.toggle(true)
		})
		.on('mouseout', () => {
			popup.toggle(false)
		})
})

/* 修正嵌套使用删除线、黑幕、彩色幕和胡话模板 */
const templateTags = ['s', 'del']
const templateClasses = ['heimu', 'colormu', 'just-kidding-text']
const templateStr = [...templateTags, ...templateClasses.map((x) => `.${x}`)].join(',')
const templateFix = ($content: JQuery<HTMLElement>) => {
	$content.find(templateStr).each((_, ele: HTMLElement) => {
		// 我真受不了这tmd代码了
		if ((ele as { isTemplateFixed?: true }).isTemplateFixed) {
			return
		}
		;(ele as { isTemplateFixed?: true }).isTemplateFixed = true
		const subElements = [...ele.querySelectorAll(templateStr)]
		if (subElements.length > 0) {
			subElements.forEach((subElement) => {
				;(subElement as { isTemplateFixed?: true }).isTemplateFixed = true
				subElement.classList.remove(...templateClasses)
			})
			console.info('TemplateFix', ele, subElements)
		}
	})
}

void (async () => {
	await $.ready

	/* 反嵌入 */
	try {
		let substHost
		try {
			substHost = top!.location.host
		} catch {
			substHost = ''
		}
		const currentHostIsUnofficial = !/(?:^|\.)voca\.wiki\.?$/u.test(location.host)
		if (top !== window || currentHostIsUnofficial) {
			const detectedHost = currentHostIsUnofficial ? location.host : substHost
			oouiDialog.alert(
				`<p>您当前是在${currentHostIsUnofficial ? '非Vocawiki域名' : '嵌套窗口'}访问，请注意不要在此域名下输入您的用户名或密码，以策安全！</p><p>${detectedHost ? `${currentHostIsUnofficial ? '当前' : '顶层窗口'}域名为 <code>${detectedHost}</code>，` : ''}Vocawiki域名为 <code>voca.wiki</code> 。</p>`,
				{
					title: 'Vocawiki提醒您',
					size: 'medium',
				},
			)
		}
	} catch (e) {
		console.debug(e)
	}

	// 修复错误嵌套模板
	mw.hook('wikipage.content').add(templateFix)

	const needHashChange = /[)]$/u.test(location.pathname + location.search)
	if (needHashChange) {
		const originHash = location.hash
		location.hash = '%'
		location.hash = originHash
	}
	$window.on('hashchange.hashchange', () => {
		const hash = decodeURIComponent(location.hash.replace(/^#/u, ''))
		if (hash.length > 0) {
			const target = document.getElementById(hash)
			if (target) {
				const $target = $(target)
				const needScroll = true
				const mwCollapsible = $target.closest('.mw-collapsible.mw-collapsed')
				if (mwCollapsible.length > 0) {
					mwCollapsible.find('.mw-collapsible-toggle').first().triggerHandler('click')
				}
				const tabContentTextUnselected = $target.closest('.TabContentText:not(.selected)')
				if (tabContentTextUnselected.length > 0) {
					tabContentTextUnselected
						.closest('.Tabs')
						.children('.TabLabel')
						.children()
						.eq(tabContentTextUnselected.index())
						.trigger('click')
				}
				// FIXME: 萌娘百科来的，暂时保留，可能是功能开关
				// oxlint-disable-next-line typescript/no-unnecessary-condition
				if (needScroll) {
					setTimeout(() => {
						$('html, body').scrollTop($target.offset()!.top - window.innerHeight / 8)
					}, 50)
				}
			}
		}
	})
	$window.triggerHandler('hashchange.hashchange')

	modifyLayout()
	hookRandomSongLinkClick()

	switch (wgCanonicalSpecialPageName) {
		case 'Upload':
			$('#wpLicense').val('Copyright')
			break
		case 'BatchUpload':
			$('textarea').val('{{Copyright}}')
			break
		case 'MassEditRegex':
			$('#wpSummaryLabel').text('摘要：') // 临时修复：批量正则编辑
			break
		default:
	}

	// 快速填写编辑摘要
	if (wgAction === 'edit') {
		$('[for="wpSummary"] .mw-summary-preset-item a').on('click', (e) => {
			const summaryBox = $('[name="wpSummary"]')
			summaryBox.val(`${String(summaryBox.val())} ${$(e.currentTarget).text()}`.trim())
			summaryBox.trigger('focus')
			return false
		})
	}

	cleanLocalStorage()
})()
