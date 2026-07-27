/**
 * 本文件进入仓库前的编辑历史和贡献者请见
 * https://voca.wiki/MediaWiki:Gadget-SideBarPic.js?action=history
 */

import { sleep } from 'radashi'

void (async () => {
	await $.ready

	const sidebarSelector = 'html > body'

	let $sidebar = $(sidebarSelector)
	while ($sidebar.length === 0) {
		await sleep(100)
		$sidebar = $(sidebarSelector)
	}
	console.info('Widget:SideBarPic pre-init-check', $sidebar)

	if ($('body').hasClass('sideBarPic-executed')) {
		return
	}

	const $sidebarCharacter = $('.sidebar-character:not(.executed)').slice(0, 3)
	if ($sidebarCharacter.length === 0) {
		return
	}

	$('body').addClass('sideBarPic-executed')
	$sidebarCharacter.addClass('executed')

	await Promise.all(
		$sidebarCharacter
			.find('img')
			.toArray()
			.map(
				(img) =>
					new Promise<void>((res) => {
						let retryCount = 0
						try {
							const lazyLoad = new Image()
							const url = new URL(img.dataset.src || img.src, location.origin)
							lazyLoad.addEventListener('load', () => {
								img.src = url.toString()
								res()
							})
							lazyLoad.addEventListener('error', () => {
								if (retryCount++ < 3) {
									const url = new URL(lazyLoad.src, location.origin)
									url.searchParams.set('_', Math.random().toString())
									lazyLoad.src = url.toString()
								} else {
									console.info('Widget:SideBarPic img-load-failed\n', img.dataset.src)
									img.remove()
									res()
								}
							})
							lazyLoad.src = url.toString()
						} catch (e) {
							console.info('Widget:SideBarPic img-load-failed\n', e)
							img.remove()
							res()
						}
					}),
			),
	)
	$('body').addClass('sideBarPic')

	$sidebarCharacter.each((_, ele) => {
		const $this = $(ele)
		if (!$this.find('img')[0]) {
			return
		}
		if (mw.config.get('skin') === 'vector-2022') {
			$this.css('position', 'absolute')
		}
		console.info('Widget:SideBarPic append-check\n', $sidebar)
		$this.appendTo($sidebar)
		$this
			.fadeIn()
			.addClass(ele.dataset.align === 'top' ? 'top' : 'bottom')
			.css('user-select', 'none')
		$this.addClass('active').find('img').removeAttr('width').removeAttr('height')
	})
	$(window)
		.on('resize', () => {
			$sidebarCharacter.each((_, ele) => {
				const self = $(ele)
				self.find('img').width(self.width()!)
			})
		})
		.trigger('resize')
	if ($sidebarCharacter.data('displaylogo') === 'yes') {
		$('body').addClass('show-logo')
	}
})()
