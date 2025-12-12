/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { depend } from '~/snippets/rlq'

depend('jquery', () => $(() => void main()))

async function main() {
	if (document.body.clientWidth < 550) {
		$('.menu-item').on('click', function () {
			$(this).children('.menu-content').toggle()
		})
		return
	}
	await mw.loader.using(['ext.gadget.LocalObjectStorage'])
	const localObjectStorage = new (window as any).LocalObjectStorage('AnnTools-TopicNavBar')
	const showAll = ($container: JQuery<HTMLElement>) => {
		$container.find('.menu-content').show()
		$container.find('.menu-content .menu-popout').css('position', 'relative')
		$container.find('.menu-content ul ul').css('height', 'auto')
		$container.find('.menu-item .menu-title').css('background-color', '#9dd5ff')
		const status = localObjectStorage.getItem('status', {})
		status[$container.attr('id')!.trim()] = 'show'
		localObjectStorage.setItem('status', status)
		$container.find('.ztdh-hsctrl').html('[ 隐藏全部 ]')
	}
	const hideAll = ($container: JQuery<HTMLElement>) => {
		$container
			.find(
				'.menu-content, .menu-content .menu-popout, .menu-content ul ul, .menu-item .menu-title',
			)
			.removeAttr('style')
		const status = localObjectStorage.getItem('status', {})
		status[$container.attr('id')!.trim()] = 'hide'
		localObjectStorage.setItem('status', status)
		$container.find('.ztdh-hsctrl').html('[ 显示全部 ]')
	}
	$('.ztdh-hsctrl').on('click', ({ target }) => {
		const $target = $(target)
		const $container = $target.closest('.ztdh')
		if ($target.text().includes('显示全部')) {
			showAll($container)
		} else {
			hideAll($container)
		}
	})
	const status = localObjectStorage.getItem('status', {})
	for (const ele of $('.ztdh')) {
		const $container = $(ele)
		const id = ele.id.trim()
		if (status[id] === 'show') {
			showAll($container)
		} else {
			status[id] = 'hide'
		}
	}
	localObjectStorage.setItem('status', status)
}
