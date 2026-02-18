import { polyfillRandomUUID } from './polyfill-random-uuid'
import { tabs } from './tabs'

declare global {
	var oouiDialog: {
		alert: (...args: any[]) => void
		sanitize: (str: string) => string
	}
}

/* 为不安全上下文提供`crypto.randomUUID()`（目前被几个Widget使用） */
polyfillRandomUUID()

/* 检查是否为维护组成员 */
const wgUserGroups = mw.config.get('wgUserGroups')
const isSysOp = wgUserGroups!.includes('sysop')

const wgNamespaceNumber = mw.config.get('wgNamespaceNumber')
const wgCanonicalSpecialPageName = mw.config.get('wgCanonicalSpecialPageName')

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
const templateClasses = ['.heimu', '.colormu', '.just-kidding-text']
const templateStr = [...templateTags, ...templateClasses].join(', ')
const templateFix = ($content: JQuery<HTMLElement>) => {
	const target = $()
	$content.find(templateStr).each((_, ele: HTMLElement) => {
		// 我真受不了这tmd代码了
		if ((ele as { isTemplateFixed?: true }).isTemplateFixed) {
			return
		}
		;(ele as { isTemplateFixed?: true }).isTemplateFixed = true
		const subElements = Array.from(ele.querySelectorAll(templateStr))
		if (subElements.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
			;(target as any).push(ele)
			subElements.forEach((subElement) => {
				;(subElement as { isTemplateFixed?: true }).isTemplateFixed = true
				templateClasses.forEach((cls) => {
					if (!isSysOp) {
						subElement.classList.remove(cls.substring(1))
					}
				})
			})
			console.info('TemplateFix', ele, subElements)
		}
	})
	if (wgNamespaceNumber >= 0 && wgNamespaceNumber % 2 === 0 && target.length > 0) {
		if (+mw.user.options.get('gadget-enable-nest-highlight', 0) === 1 || isSysOp) {
			target.css('border', '3px dashed red')
		}
		if (isSysOp && +mw.user.options.get('gadget-disable-nest-alert', 0) !== 1) {
			oouiDialog.alert(
				`本页面含有嵌套使用（混用）以下标签或模板的内容（已用红色虚线边框标识），请检查源码并修改之：<ul><li>删除线：<code>${oouiDialog.sanitize('<s>')}</code>、<code>${oouiDialog.sanitize('<del>')}</code>；</li><li>黑幕：<code>{{黑幕}}</code>、<code>{{Block}}</code>、<code>{{Heimu}}</code>；</li><li>彩色幕：<code>{{彩色幕}}</code>；</li><li>胡话：<code>{{胡话}}</code>、<code>{{jk}}</code>，大小写不限。</li></ul>`,
				{
					title: 'Vocawiki提醒您',
					size: 'medium',
				},
			)
		}
	}
}

// 列表侧边距
const listMarginLeft = () => {
	$(
		'.mw-parser-output ul:not(.margin-left-set), .mw-parser-output ol:not(.margin-left-set), #mw-content-text > pre.prettyprint ul:not(.margin-left-set), #mw-content-text > pre.prettyprint ol:not(.margin-left-set)',
	).each((_, ele) => {
		const $ele = $(ele)
		if (/none.+none/i.test($ele.css('list-style')) || $ele.is('.gallery')) {
			if ($ele.parent().is('li') && $ele.parent().parent().is('ul, ol')) {
				$ele.css('margin-left', '1.2em')
			} else {
				$ele.css('margin-left', '0.2em')
			}
		} else if ($ele.is('ol')) {
			const li = $ele.children('li')
			const start = $ele.attr('start')
			let max = /^\d+$/.test(start!) ? +start! : 0
			li.each((_, e) => {
				const value = $(e).attr('value')
				if (/^\d+$/.test(value!)) {
					max = Math.max(max, +value!)
				} else {
					max++
				}
			})
			$ele
				.attr('data-last-margin-left-max-length', max)
				.css('margin-left', `${`${max}`.length * 0.5 + 1.2}em`)
		} else {
			$ele.css('margin-left', '1.2em')
		}
		$ele.addClass('margin-left-set')
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

	tabs()

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

	// 列表侧边距
	setInterval(listMarginLeft, 200)

	// Template:Mail@
	;['copy', 'keydown', 'scroll', 'mousemove'].forEach((type) => {
		document.addEventListener(
			type,
			() => {
				$('.mailSymbol').replaceWith('<span title="Template:Mail@">@</span>')
			},
			{
				capture: true,
				passive: true,
			},
		)
	})

	switch (wgCanonicalSpecialPageName) {
		case 'Upload':
			$('#wpLicense').val('Copyright')
			break
		case 'BatchUpload':
			$('textarea').val('{{Copyright}}')
			break
	}

	// 使挂删模板位于文件页顶部
	if (wgNamespaceNumber === 6) {
		// 我真蚌埠住了，这个“will2Be2Deleted”类名
		if ($('.ns-6 #mw-imagepage-content')[0] && $('.will2Be2Deleted')[0]) {
			$('#file').before($('#mw-imagepage-content'))
		}
		$('.ns-6 .will2Be2Deleted').css('margin-bottom', '1rem !important')
	}
})()
