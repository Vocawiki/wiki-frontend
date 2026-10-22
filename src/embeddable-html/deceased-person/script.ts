import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	['ext.gadget.libBottomRightCorner', 'ext.gadget.libOOUIDialog', 'ext.gadget.site-lib'],
	() => {
		$('html')[
			sessionStorage.getItem('WidgetDeceasedPersonGrayClass') === 'removeClass'
				? 'removeClass'
				: 'addClass'
		]('gray')
		mw.loader.addStyleTag(`html.gray:before { background: ${$('body').css('background')}; }`)
		// oxlint-disable-next-line typescript/no-unsafe-call typescript/no-unsafe-member-access -- 该函数由 libBottomRightCorner 注入，实际返回 jQuery 对象
		insertToBottomRightCorner(wgULS('切换灰度模式', '切換灰度模式')).on('click', () => {
			$('html').toggleClass('gray')
			if (sessionStorage.getItem('WidgetDeceasedPersonGrayClass') === null) {
				oouiDialog.alert(
					wgULS(
						'该切换功能会影响所有使用灰度模式的页面，并在浏览器关闭后会重置回默认的【开启】状态。',
						'該切換功能會影響所有使用灰度模式的頁面，並在瀏覽器關閉後會重置回預設的【開啟】狀態。',
					),
					{
						title: wgULS('灰度模式切换提示', '灰度模式切換提示'),
					},
				)
			}
			sessionStorage.setItem(
				'WidgetDeceasedPersonGrayClass',
				$('html').is('.gray') ? 'addClass' : 'removeClass',
			)
		})
	},
])
