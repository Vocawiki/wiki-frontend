/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Hover?action=history
 */
window.RLQ ??= []
window.RLQ.push([
	'jquery',
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
