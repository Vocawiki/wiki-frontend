// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
window.RLQ ??= []

function showX18Warning({
	title,
	buttons,
	onYes,
	onNo,
}: {
	title: string
	buttons: string
	onYes?: () => void
	onNo?: () => void
}) {
	$('body').css('overflow', 'hidden')
	$('#mw-content-text')
		.css('height', `${$('#mw-content-text').height()}px`)
		.empty()
	$('#x18,#x18Style')
		.find('.x18Button')
		.append(buttons)
		.end()
		.find('#x18Title')
		.append(title)
		.end()
		.delay(400)
		.queue(function () {
			$(this).css({ opacity: 1, transition: 'opacity 0.37s linear' })
			$(this).dequeue()
		})
	if (onYes) $('#x18Yes').on('click', onYes)
	if (onNo) $('#x18No').on('click', onNo)
}

window.RLQ.push([
	['mediawiki.api', 'jquery'],
	async () => {
		$('#x18,#x18Style').prependTo('body')
		$('.x18-page-warning').appendTo('.mw-panel')
		$('#mw-content-text').css('transition', 'opacity 0.37s linear')
		if (mw.config.get('wgUserName') === null) {
			showX18Warning({
				title: '请登录后查看',
				buttons: decodeURIComponent(
					'%3Cdiv%20id%3D%22x18Yes%22%3E%E6%88%91%E8%A6%81%E7%99%BB%E9%99%86%3C%2Fdiv%3E%3Cdiv%20id%3D%22x18No%22%20class%3D%22x18Button%22%3E%E6%89%8D%E4%B8%8D%E7%90%86%E4%BD%A0%3C%2Fdiv%3E',
				),
				onYes: () => {
					window.location.replace(
						`https://${location.host}${mw.config.get('wgScriptPath')}/index.php?title=Special:%E7%94%A8%E6%88%B7%E7%99%BB%E5%BD%95&returnto=${encodeURIComponent(mw.config.get('wgPageName'))}`,
					)
				},
				onNo: () => {
					window.location.replace(
						`https://${location.host}${mw.config.get('wgScriptPath')}/${String(mw.config.get('wgMainPageTitle'))}`,
					)
				},
			})
			return
		}
		if (!mw.config.get('wgUserGroups')!.includes('autoconfirmed')) {
			showX18Warning({
				title: '未有足够权限查看',
				buttons: decodeURIComponent(
					'%3Cdiv%20id%3D%22x18No%22%20class%3D%22x18Button%22%3E%E5%A5%BD%E5%90%A7%E4%B8%8D%E7%9C%8B%3C%2Fdiv%3E',
				),
				onNo: () => {
					window.location.replace(
						`https://${location.host}${mw.config.get('wgScriptPath')}/${String(mw.config.get('wgMainPageTitle'))}`,
					)
				},
			})
			return
		}
		let isBlock = false
		let isApiFailure = false
		try {
			isBlock =
				'blockid' in
				(
					(await new mw.Api().post({
						format: 'json',
						action: 'query',
						list: 'users',
						ususers: mw.config.get('wgUserName')!,
						usprop: 'blockinfo',
					})) as { query: { users: Record<string, unknown>[] } }
				).query.users[0]!
		} catch {
			isApiFailure = true
		}
		if (isApiFailure || isBlock) {
			showX18Warning({
				title: `${isApiFailure ? '无法确认您是否' : '您已'}被封禁，无权查看~`,
				buttons: decodeURIComponent(
					'%3Cdiv%20id%3D%22x18No%22%20class%3D%22x18Button%22%3E%E5%A5%BD%E5%90%A7%E4%B8%8D%E7%9C%8B%3C%2Fdiv%3E',
				),
				onNo: () => {
					window.location.replace(
						`https://${location.host}${mw.config.get('wgScriptPath')}/${String(mw.config.get('wgMainPageTitle'))}`,
					)
				},
			})
		} else if (window.localStorage.getItem('x18') === '1') {
			$('#x18').remove()
			$('#mw-content-text').css('opacity', 1)
		} else {
			showX18Warning({
				title: '你是否已年满十八岁？',
				buttons: decodeURIComponent(
					'%3Cdiv%20id%3D%22x18Yes%22%3E%E6%98%AF%3C%2Fdiv%3E%3Cdiv%20id%3D%22x18No%22%20class%3D%22x18Button%22%3E%E5%90%A6%3C%2Fdiv%3E',
				),
				onYes: () => {
					window.localStorage.setItem('x18', '1')
					$('#mw-content-text')
						.css('opacity', 1)
						.delay(400)
						.queue(function () {
							$('#mw-content-text').css('transition', 'none')
							$(this).dequeue()
						})
					$('#x18')
						.css('opacity', 0)
						.delay(400)
						.queue(function () {
							$('body').removeAttr('style')
							$(this).remove()
							$(this).dequeue()
						})
				},
				onNo: () => {
					window.location.replace(
						`https://${location.host}${mw.config.get('wgScriptPath')}/${String(mw.config.get('wgMainPageTitle'))}`,
					)
				},
			})
		}
	},
])
