/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

// TMD改天给它废掉

export function tabs() {
	const body = document.body
	const $body = $(body)
	const $window = $(window)
	const defaultStyle: Record<
		string,
		{
			labelColor: string
			labelBackgroundColor: string
			labelBorderColor: string
			labelPadding: string
			textBorderColor: string
			textBackgroundColor: string
			textPadding: string
		}
	> = {
		purple: {
			labelColor: ' ',
			labelBackgroundColor: '#9070c0',
			labelBorderColor: '#b090e0 #7050a0 #9070c0 #b090e0',
			labelPadding: '.2em .3em .2em .3em',
			textBorderColor: '#9070c0',
			textBackgroundColor: '#f0edf5',
			textPadding: '1em',
		},
		green: {
			labelColor: ' ',
			labelBackgroundColor: '#75c045',
			labelBorderColor: '#90d060 #60b030 #75c045 #90d060',
			labelPadding: '.2em .3em .2em .3em',
			textBorderColor: '#75c045 #60b030 #60b030 #75c045',
			textBackgroundColor: '#f5fffa',
			textPadding: '1em',
		},
		red: {
			labelColor: ' ',
			labelBackgroundColor: '#FF0000',
			labelBorderColor: '#FF8888 #CC0000 #FF0000 #FF8888',
			labelPadding: '.2em .3em .2em .3em',
			textBorderColor: '#FF0000 #CC0000 #CC0000 #FF0000',
			textBackgroundColor: '#fffafa',
			textPadding: '1em',
		},
		blue: {
			labelColor: ' ',
			labelBackgroundColor: '#5b8dd6',
			labelBorderColor: '#88abde #3379de #5b8dd6 #88abde',
			labelPadding: '.2em .3em .2em .3em',
			textBackgroundColor: '#f0f8ff',
			textBorderColor: '#5b8dd6 #3379de #3379de #5b8dd6',
			textPadding: '1em',
		},
		yellow: {
			labelColor: ' ',
			labelBackgroundColor: '#ffe147',
			labelBorderColor: '#ffe977 #ffd813 #ffe147 #ffe977',
			labelPadding: '.2em .3em .2em .3em',
			textBackgroundColor: '#fffce8',
			textBorderColor: '#ffe147 #ffd813 #ffd813 #ffe147',
			textPadding: '1em',
		},
		orange: {
			labelColor: ' ',
			labelBackgroundColor: '#ff9d42',
			labelBorderColor: '#ffac5d #ff820e #ff9d42 #ffac5d',
			labelPadding: '.2em .3em .2em .3em',
			textBackgroundColor: '#ffeedd',
			textBorderColor: '#ff9d42 #ff820e #ff820e #ff9d42',
			textPadding: '1em',
		},
		black: {
			labelColor: '#fff',
			labelBackgroundColor: '#7f7f7f',
			labelBorderColor: '#999999 #4c4c4c #7f7f7f #999999',
			labelPadding: '.2em .3em .2em .3em',
			textBackgroundColor: '#e5e5e5',
			textBorderColor: '#7f7f7f #4c4c4c #4c4c4c #7f7f7f',
			textPadding: '1em',
		},
		transparent: {
			labelColor: ' ',
			labelBackgroundColor: '#fff',
			labelBorderColor: '#000',
			labelPadding: '.2em .3em .2em .3em',
			textBackgroundColor: 'transparent',
			textBorderColor: 'transparent',
			textPadding: '10px 0px',
		},
	}
	const sides = {
		top: {
			className: 'tabLabelTop',
			labelColorSide: 'top',
			labelBorderSide: ['left', 'right'],
			labelColorSideReverse: 'bottom',
			dividerSizeType: 'height',
		},
		bottom: {
			className: 'tabLabelBottom',
			labelColorSide: 'bottom',
			labelBorderSide: ['left', 'right'],
			labelColorSideReverse: 'top',
			dividerSizeType: 'height',
		},
		left: {
			className: 'tabLabelLeft',
			labelColorSide: 'left',
			labelBorderSide: ['top', 'bottom'],
			labelColorSideReverse: 'right',
			dividerSizeType: 'width',
		},
		right: {
			className: 'tabLabelRight',
			labelColorSide: 'right',
			labelBorderSide: ['top', 'bottom'],
			labelColorSideReverse: 'left',
			dividerSizeType: 'width',
		},
	}
	const truthy = ['1', 'on', 'true', 'yes']
	$body.addClass('tab')
	const getOwnPropertyNamesLength = (obj: any) => Reflect.ownKeys(obj).length
	const toLowerFirstCase = (str: string) => str.substring(0, 1).toLowerCase() + str.substring(1)
	const toUpperFirstCase = (str: string) => str.substring(0, 1).toUpperCase() + str.substring(1)
	mw.hook('wikipage.content').add((content) => {
		content.find('.Tabs').each(function () {
			const self = $(this)
			if (self.children('.TabLabel')[0]) {
				return
			}
			const classList = Array.from(this.classList).filter((n) => Reflect.has(defaultStyle, n))
			const data = $.extend(
				{
					labelPadding: '2px',
					labelBorderColor: '#aaa',
					labelColor: 'green',
					labelBackgroundColor: $('#content').css('background-color') || 'rgba(247,251,255,0.8)',
					textPadding: '20px 30px',
					textBorderColor: '#aaa',
					textBackgroundColor: 'white',
					defaultTab: 1,
				},
				classList[0] ? (defaultStyle[classList[0]] ?? {}) : {},
				this.dataset || {},
			)
			const styleSheet = {
				label: {},
				text: {},
			}
			const tabLabel = self.append('<div class="TabLabel"></' + 'div>').children('.TabLabel'),
				tabDivider = self.append('<div class="TabDivider"></' + 'div>').children('.TabDivider'),
				tabContent = self.append('<div class="TabContent"></' + 'div>').children('.TabContent'),
				labelPadding = data.labelPadding,
				labelColor = data.labelColor,
				labelSide = Reflect.has(sides, data.labelSide as any) ? data.labelSide : 'top',
				side = sides[labelSide as keyof typeof sides],
				labelColorSideReverse = truthy.includes(data.labelColorSideReverse as any),
				dividerSize = parseInt(data.dividerSize as any)
			let defaultTab = parseInt(data.defaultTab as any)
			if (labelSide === 'top') {
				tabLabel.after(tabDivider)
				tabDivider.after(tabContent)
			} else if (labelSide === 'bottom') {
				tabContent.after(tabDivider)
				tabDivider.after(tabLabel)
			}
			if (!isNaN(dividerSize) && dividerSize > 0) {
				;(self.find('.TabDivider')[side.dividerSizeType as unknown as number] as any)(dividerSize)
			}
			const labelColorName = toUpperFirstCase(
				labelColorSideReverse ? side.labelColorSideReverse : side.labelColorSide,
			)
			self.addClass(side.className)
			if (labelColorSideReverse) {
				self.addClass('reverse')
			}
			self.children('.Tab').each(function () {
				if (
					$(this).children('.TabLabelText').text().replace(/\s/g, '').length ||
					$(this).children('.TabLabelText').children().length
				) {
					$(this).children('.TabLabelText').appendTo(tabLabel)
					$(this).children('.TabContentText').appendTo(self.children('.TabContent'))
				}
				$(this).remove()
			})
			if (
				isNaN(defaultTab) ||
				defaultTab <= 0 ||
				defaultTab > tabLabel.children('.TabLabelText').length
			) {
				defaultTab = 1
			}
			tabLabel
				.children('.TabLabelText')
				.on('click', function () {
					const label = $(this)
					label.addClass('selected').siblings().removeClass('selected').css({
						'border-color': 'transparent',
						'background-color': 'inherit',
					})
					tabContent
						.children('.TabContentText')
						.eq(tabLabel.children('.TabLabelText').index(label))
						.addClass('selected')
						.siblings()
						.removeClass('selected')
						.removeAttr('style')
					if (getOwnPropertyNamesLength(styleSheet.label) > 0) {
						label.css(styleSheet.label)
					}
					setTimeout(() => {
						$window.triggerHandler('scroll')
					}, 1)
				})
				.eq(defaultTab - 1)
				.trigger('click')
			if (labelPadding) {
				tabLabel.children('.TabLabelText').css('padding', labelPadding)
			}
			;[
				'labelBorderColor',
				'labelBackgroundColor',
				'textPadding',
				'textBorderColor',
				'textBackgroundColor',
			].forEach((n) => {
				const target = n.startsWith('label') ? 'label' : 'text',
					key = toLowerFirstCase(n.replace(target, ''))
				// @ts-expect-error 这代码没有改的意义了
				styleSheet[target][key] = data[n]
			})
			if (labelColor) {
				// @ts-expect-error 这代码没有改的意义了
				styleSheet.label[`border${labelColorName}Color`] = labelColor
			} else if ((styleSheet.label as any).borderColor) {
				// @ts-expect-error 这代码没有改的意义了
				styleSheet.label[`border${labelColorName}Color`] = 'green'
			}
			tabLabel.find('.selected').trigger('click')
			if (getOwnPropertyNamesLength(styleSheet.text) > 0) {
				tabContent.css(styleSheet.text)
			}
			if (data.autoWidth === 'yes') {
				self.addClass('AutoWidth')
			}
			if (data.float === 'left') {
				self.addClass('FloatLeft')
			}
			if (data.float === 'right') {
				self.addClass('FloatRight')
			}
		})
	})
}
