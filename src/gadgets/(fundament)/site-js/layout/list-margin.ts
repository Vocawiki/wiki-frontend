export function applyListMargin() {
	setInterval(applyListMarginLeftOnce, 200)
}

function applyListMarginLeftOnce() {
	$('.mw-parser-output :is(ol, ul):not(.margin-left-set, .preflight *)').each((_, ele) => {
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
