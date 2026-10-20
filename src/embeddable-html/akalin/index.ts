/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Akalin?action=history
 */

window.RLQ ??= []
window.RLQ.push([
	'jquery',
	async () => {
		await $.ready
		const zero = `<span style="speak:none;visibility:hidden;color:transparent">0</span>`
		const fixZero = (v: string | number) => {
			let s = `${v}`
			for (let i = s.length; i < 3; i++) {
				s = `${zero}${s}`
			}
			return s
		}
		$('.akalinController')
			.show()
			.each((index, akalinController) => {
				const { defaultOpacity, selector } = akalinController.dataset
				const opacity = Math.round(Math.max(0, Math.min(1, Number(defaultOpacity))) * 100)
				const id = `akalinControllerList-${index}`
				const monitor = document.createElement('span')
				monitor.innerHTML = `${fixZero(opacity)}%）：`
				akalinController.appendChild(monitor)
				const range = document.createElement('input')
				const $range = $(range)
				range.type = 'range'
				range.setAttribute('list', id)
				range.max = '100'
				range.min = '0'
				range.step = '1'
				range.value = `${opacity}`
				range.style.width = '100%'
				range.style.maxWidth = '30em'
				akalinController.append(range)
				const list = document.createElement('datalist')
				list.id = id
				const labeledValues = [0, 50, 100]
				for (let v = 0; v <= 100; v += 10) {
					const selected = v === opacity
					const option = new Option(`${v}%`, `${v}`, selected, selected)
					if (selected || labeledValues.includes(v)) {
						option.label = `${v}%`
					}
					list.appendChild(option)
				}
				akalinController.append(list)

				const allElements =
					selector === '*'
						? $('#mw-content-text > .mw-parser-output > *')
						: $('#mw-content-text > .mw-parser-output').find(selector!)
				const elements = allElements
					.not('#toc,.infoBox,.infotemplatebox')
					.add(allElements.filter('h2').nextAll())
				const others = allElements.filter('#toc,.infoBox,.infotemplatebox')
				elements.each((_, ele) => {
					const $ele = $(ele)
					const oldTransition = $ele.css('transition')
					$ele.css({
						transition: 'opacity 233ms ease-in-out',
						opacity: Number(range.value) / 100,
					})
					setTimeout(() => {
						$ele.css('transition', oldTransition)
					}, 300)
				})
				others.css('position', 'relative').css('z-index', '1')
				$range.on('change input', () => {
					elements.css('opacity', Number(range.value) / 100)
					monitor.innerHTML = `${fixZero(range.value)}%）：`
				})
			})
	},
])
