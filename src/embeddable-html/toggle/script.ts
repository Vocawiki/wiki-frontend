window.RLQ ??= []
window.RLQ.push([
	['jquery', 'mediawiki.base'],
	async () => {
		$(window).on('load', () => {
			$('.mw-customtoggle > span > a > img').on('click', function () {
				$(this).closest('span').trigger('click')
				return false
			})
		})
		await $.ready
		$('.toggle-template-container').each(function () {
			const $ele = $(this)
			const isParent = $ele.data('customParent') === true // for Template:Toggle 内联按钮
			const isLeft = $ele.data('customLeft') === true // for Template:ToggleInline
			const id = ($ele.data('customId') as string | undefined) || crypto.randomUUID()

			$ele.addClass(`mw-customtoggle-${id}`)

			const $startNode = isParent ? $ele.parent() : $ele
			let $target = isLeft ? $startNode.prev() : $startNode.next()

			while ($target.length) {
				if ($target.hasClass('mw-collapsible') && $target.hasClass('toggle-template-button')) {
					$target.attr('id', `mw-customcollapsible-${id}`)
					break
				}
				$target = isLeft ? $target.prev() : $target.next()
			}
		})
	},
])
