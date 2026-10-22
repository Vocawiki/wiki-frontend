/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:UserName?action=history
 */

import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		const wgUserName = mw.config.get('wgUserName')
		$('#mw-content-text .userNameInText').each((_, ele) => {
			const $e = $(ele)
			const [nextReference] = $e.next('.reference')
			if (nextReference) {
				$e.text(wgUserName || ele.dataset.fallback || '初音未来')
				const attributeNode = nextReference.getAttributeNode('style')
				if (attributeNode) {
					attributeNode.textContent += ';all:revert!important;'
				} else {
					nextReference.setAttribute('style', 'all:revert!important;')
				}
			} else {
				$e.css('color', 'red').text('未找到用户名注释，请使用{{Username}}')
			}
		})
	},
])
