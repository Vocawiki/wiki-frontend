window.RLQ ??= []
// @ts-expect-error RLQ 也支持只传回调，但类型定义仅允许 [依赖, 回调] 元组
window.RLQ.push(() => {
	if (window.navigator.userAgent.toLowerCase().includes('mobile')) {
		console.debug('移动版不适用分类重整')
	} else if (!mw.config.get('widgetBrokenPageLink')) {
		mw.config.set('widgetBrokenPageLink', 'on')
		$(() => {
			const $catctx = $('.mw-category-generated')
			let $catpages = $('#mw-pages')
			const $imppages = $('<div/>', {
				class: 'mw-category-important mw-category-group',
			}).append('<h3 style="font-weight: normal;">（主）命名空间页面</h3><ul></ul>')
			const catpageLen = $catpages.find('li').length
			if (!catpageLen) return
			if ($catpages.find('.mw-category-group')[0]) {
				$catpages.find('.mw-category-group').each(function () {
					$(this).attr('data-index', $(this).find('h3').text())
				})
			} else {
				$('<div/>', { class: 'mw-category' })
					.append($catpages.find('.mw-content-ltr').children())
					.appendTo($catpages.find('.mw-content-ltr'))
					.find('h3')
					.each(function () {
						const group = $('<div/>', { class: 'mw-category-group' })
						$(this).before(group)
						group.prepend($(this).next()).prepend($(this)).attr('data-index', $(this).text())
					})
				$catpages = $('#mw-subcategories')
			}
			const namespaces = mw.config.get('wgFormattedNamespaces')
			const namespaceIds = mw.config.get('wgNamespaceIds')
			const namespaceIdsKeys = Object.keys(namespaceIds)
			$catpages.find('li').each(function () {
				const pagename = $(this).find('a:first').text()
				const key = (pagename.match(/^[^:]+:/u) ?? [''])[0]
					.replace(/:$/u, '')
					.replace(/ /gu, '_')
					.toLowerCase()
				const hasKey = namespaceIdsKeys.includes(key)
				const namespace = hasKey ? namespaces[namespaceIds[key]!] || '（主）' : '（主）'
				$(this).attr('data-namespace', namespace)
				$(this).attr('data-title', pagename)
			})
			const $groups = $catpages.find('.mw-category-group')
			// jQuery 集合继承 Array.prototype.sort（原地排序并返回自身），但类型定义中未声明 sort
			;($groups as unknown as HTMLElement[]).sort((a, b) =>
				a.dataset.index!.localeCompare(b.dataset.index!),
			)
			$groups.appendTo($catpages.find('.mw-category'))
			$catpages.find('li[data-namespace="（主）"]').appendTo($imppages.find('ul'))
			$catpages.find('.mw-category-group').each(function () {
				if (!$(this).find('li')[0]) $(this).remove()
			})
			if ($imppages.find('li')[0])
				$catpages.find('.mw-content-ltr').before($imppages).before('<hr>')
			const $impLis = $imppages.find('li')
			// jQuery 集合继承 Array.prototype.sort（原地排序并返回自身），但类型定义中未声明 sort
			;($impLis as unknown as HTMLElement[]).sort((a, b) =>
				a.dataset.title!.localeCompare(b.dataset.title!),
			)
			$impLis.appendTo($imppages.find('ul'))
			$catctx.addClass('BrokenPageLink')
		})
	}
})
