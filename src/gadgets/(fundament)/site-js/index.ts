import { cleanLocalStorage } from './clean-localstorage'
import { modifyLayout } from './layout'
import { polyfillRandomUUID } from './polyfill-random-uuid'
import { hookRandomSongLinkClick } from './random-song'

declare global {
	var oouiDialog: {
		alert: (...args: any[]) => void
		sanitize: (str: string) => string
	}
}

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
		const currentHostIsUnofficial = !/(?:^|\.)voca\.wiki\.?$/.test(location.host)
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

	const needHashChange = /[)]$/.test(location.pathname + location.search)
	if (needHashChange) {
		const originHash = location.hash
		location.hash = '%'
		location.hash = originHash
	}
	$window.on('hashchange.hashchange', () => {
		const hash = decodeURIComponent(location.hash.replace(/^#/, ''))
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
