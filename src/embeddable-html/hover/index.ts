/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Hover?action=history
 */

import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		$('.hover').each(function () {
			let height = 0
			let width = 0
			$(this)
				.children()
				.each(function () {
					if ($(this).height()! > height) height = $(this).height()!
					if ($(this).width()! > width) width = $(this).width()!
				})
			if (!/width\s*:\s*\d+[a-z]+/u.test($(this).attr('style') || '')) $(this).width(width)
			if (!/height\s*:\s*\d+[a-z]+/u.test($(this).attr('style') || '')) $(this).height(height)
		})
	},
])
