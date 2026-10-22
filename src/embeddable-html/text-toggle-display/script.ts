import type { ResourceLoaderQueue } from '~/@types/rlq'
// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		const cssSanitizer = (cssStr: string) =>
			(typeof cssStr === 'string' ? cssStr : '')
				.replace(RegExp(decodeURIComponent('%3C!--'), 'gu'), '')
				.replace(RegExp(decodeURIComponent('-%3E'), 'gu'), '')
				.replace(/\/\//gu, '')
				.replace(/url/gu, '')
				.replace(/&/gu, '')
				.replace(/pointer-event/gu, ';')
				.replace(/display\s*:\s*none\s*!\s*important/gu, 'display: none')
		const uuidv4 = () => {
			let result = ''
			while (result === '' || $(`#${result}, [name="${result}"]`).length > 0) {
				// 与原实现 `[1e7] + -1e3 + ...` 的隐式字符串拼接结果完全一致
				result = [1e7, -1e3, -4e3, -8e3, -1e11]
					.join('')
					.replace(/[018]/gu, (c) =>
						(
							Number(c) ^
							((crypto.getRandomValues(new Uint8Array(1))[0]! & 15) >> (Number(c) / 4))
						).toString(16),
					)
			}
			return result
		}
		const datasetParser = (ele: HTMLElement) => {
			const result: { config: Record<string, string>; data: Record<string, string> } = {
				config: {},
				data: {},
			}
			Object.entries(ele.dataset)
				.filter(([n, m]) => n.startsWith('key-') && !/['"<>\\/]/u.test(m!))
				.forEach(([__key, _key]) => {
					const value = ele.dataset[`value-${__key.substring(4)}`]
					if (_key!.length > 0 && value!.length > 0) {
						const isConfig = _key!.startsWith('@')
						const key = isConfig ? _key!.substring(1) : _key!
						const base = result[isConfig ? 'config' : 'data']
						base[key] = value!
						if (/@o(?:n|ff)$/u.test(_key!)) {
							const id = _key!.replace(/@o(?:n|ff)$/u, '')
							if (!(id in base)) {
								base[id] = value!
							}
						} else if (_key!.endsWith('@input')) {
							base[_key!] = value!
							const id = _key!.replace(/@input$/u, '')
							if (!(id in base)) {
								base[id] = ''
							}
						} else {
							if (!(`${key}@on` in base)) {
								base[`${key}@on`] = value!
							}
							if (!(`${key}@off` in base)) {
								base[`${key}@off`] = value!
							}
							if (!(`${key}@input` in base)) {
								base[`${key}@input`] = ''
							}
						}
					}
				})
			return result
		}
		const getEntries = (obj: Record<string, string>) =>
			Object.entries(obj).filter(
				([k, n]) => !/@(?:on|off|input)$/u.test(k) && !/['"<>\\/]/u.test(n),
			)
		const textToggleDisplayStyle: Record<string, string> = {}
		$('.textToggleDisplayStyle').each((_, ele) => {
			const dataset = datasetParser(ele).data
			getEntries(dataset).forEach(([id, style]) => {
				textToggleDisplayStyle[id] = style
			})
		})
		$('.textToggleDisplay')
			.each((_, ele) => {
				const id = ele.dataset.id!
				if (id in textToggleDisplayStyle) {
					$(ele).attr('style', cssSanitizer(textToggleDisplayStyle[id]!))
				}
			})
			.addClass('hidden')
		const defaultInputs: HTMLInputElement[] = []
		$('.textToggleDisplayButtons').each((_, ele) => {
			const self = $(ele)
			const parsedDataset = datasetParser(ele)
			const ifRadio = 'radio' in parsedDataset.config && parsedDataset.config.radio.length > 0
			const ifForceNoCancel =
				'forceNoCancel' in parsedDataset.config && parsedDataset.config.forceNoCancel.length > 0
			const ifReverse = 'reverse' in parsedDataset.config && parsedDataset.config.reverse.length > 0
			const name = uuidv4()
			let hasDefault = false
			self.children('span[data-key]').each((_, e) => {
				if (/['"<>\\/]/u.test(e.dataset.key!)) {
					e.remove()
					return
				}
				const $e = $(e)
				const input = $('<input/>')
				input
					.attr({
						'data-id': e.dataset.key,
						type: ifRadio ? 'radio' : 'checkbox',
					})
					.addClass(
						ifReverse ? 'textToggleDisplayButtonInputReverse' : 'textToggleDisplayButtonInput',
					)
				if (ifRadio) {
					input.attr('name', name)
				}
				const label = $('<label/>')
				$e.children().appendTo(label)
				label
					.prepend(input)
					.appendTo(e)
					.attr('data-id', e.dataset.key!)
					.addClass('textToggleDisplayButtonLabel')
				$e.find('*').each((_, e) => {
					e.addEventListener(
						'click',
						(evt) => {
							evt.stopImmediatePropagation()
							evt.stopPropagation()
							if (!$(evt.target as Element).is(input)) {
								evt.preventDefault()
								if (ifRadio ? !input.prop('checked') : true) {
									input.prop('checked', !input.prop('checked')).trigger('change')
								}
							}
						},
						{
							capture: true,
						},
					)
				})
				if (e.dataset.key === parsedDataset.config.default) {
					defaultInputs.push(input[0] as HTMLInputElement)
					hasDefault = true
				}
			})
			// oxlint-disable-next-line typescript/no-unnecessary-condition -- hasDefault 在 each 回调内赋值，类型推断无法反映，逻辑不可改动
			if (ifRadio && (!hasDefault || !ifForceNoCancel)) {
				const input = $('<input/>')
				const inputId = uuidv4()
				input
					.attr({
						'data-id': '',
						'data-radio-cancel': 'true',
						id: inputId,
						name,
						type: 'radio',
					})
					.addClass(
						ifReverse ? 'textToggleDisplayButtonInputReverse' : 'textToggleDisplayButtonInput',
					)
					.css({
						'margin-left': '0',
						'margin-right': '0',
						width: '0',
					})
				const label = $('<label/>')
				const span = $('<span/>')
				span.text('取消选择')
				label
					.attr({
						'data-id': '',
						for: inputId,
					})
					.addClass('textToggleDisplayButtonLabel cancelButton')
				self.append(label.append(input).append(span))
				// oxlint-disable-next-line typescript/no-unnecessary-condition -- hasDefault 在 each 回调内赋值，类型推断无法反映，逻辑不可改动
				if (!hasDefault) {
					defaultInputs.push(input[0] as HTMLInputElement)
				}
			}
		})
		$('.textToggleDisplayButtonsStyle').each((_, ele) => {
			const parsedDataset = datasetParser(ele)
			$('.textToggleDisplayButtonLabel.cancelButton').attr({
				'data-style-off': parsedDataset.config['cancel@off'] || '',
				'data-style-on': parsedDataset.config['cancel@on'] || '',
			})
			$('.textToggleDisplayButtonLabel.cancelButton > input').attr(
				'style',
				cssSanitizer(parsedDataset.config['cancel@input']!),
			)
			getEntries(parsedDataset.data).forEach(([id]) => {
				$(`.textToggleDisplayButtonLabel[data-id="${id}"]`)
					.attr({
						'data-style-off': parsedDataset.data[`${id}@off`] || '',
						'data-style-on': parsedDataset.data[`${id}@on`] || '',
					})
					.children('input')
					.attr('style', cssSanitizer(parsedDataset.data[`${id}@input`]!))
			})
		})
		const setInputStatus = (input: HTMLElement, checked: boolean) => {
			const label = $(input).closest('.textToggleDisplayButtonLabel')
			const span = label.children('.on')
			label[checked ? 'addClass' : 'removeClass']('on').attr(
				'style',
				cssSanitizer(label.attr(checked ? 'data-style-on' : 'data-style-off')!),
			)
			if (checked) {
				span.attr(
					'style',
					cssSanitizer(textToggleDisplayStyle[(input as HTMLInputElement).dataset.id!]!),
				)
			} else {
				span.removeAttr('style')
			}
			const labelContainer = label.closest('span[data-order][data-key]')
			const beforeLabel = labelContainer
				.prev('span[data-order][data-key]')
				.children('.textToggleDisplayButtonLabel')
				.last()
			beforeLabel[checked ? 'addClass' : 'removeClass']('before-on')
			const afterLabel = labelContainer
				.next('span[data-order][data-key]')
				.children('.textToggleDisplayButtonLabel')
				.first()
			afterLabel[checked ? 'addClass' : 'removeClass']('after-on')
		}
		const setLabelStatus = () => {
			const map = Object.fromEntries(
				$('.textToggleDisplay')
					.toArray()
					.map(({ dataset: { id }, classList }) => [
						id,
						!classList.contains('textToggleDisplay-off'),
					]),
			) as Record<string, boolean>
			for (const input of $(
				'.textToggleDisplayButtonInput:not(.textToggleDisplayButtonLabel.cancelButton > input)',
			)) {
				const {
					dataset: { id },
				} = input as HTMLInputElement
				const cancelInput = $(input)
					.closest('.textToggleDisplayButtons')
					.find('.textToggleDisplayButtonLabel.cancelButton > input:checked')
				const checked =
					cancelInput.length > 0 ? false : id!.split('$').filter((i) => !map[i]).length === 0
				;(input as HTMLInputElement).checked = checked
				setInputStatus(input, checked)
			}
			for (const input of $(
				'.textToggleDisplayButtonInputReverse:not(.textToggleDisplayButtonLabel.cancelButton > input)',
			)) {
				const {
					dataset: { id },
				} = input as HTMLInputElement
				const cancelInput = $(input)
					.closest('.textToggleDisplayButtons')
					.find('.textToggleDisplayButtonLabel.cancelButton > input:checked')
				const checked =
					cancelInput.length > 0 ? false : id!.split('$').filter((i) => map[i]).length === 0
				;(input as HTMLInputElement).checked = checked
				setInputStatus(input, !checked)
			}
			for (const input of $('.textToggleDisplayButtonLabel.cancelButton > input')) {
				const checked =
					$(input)
						.closest('.textToggleDisplayButtons')
						.find('input')
						.not(input)
						.toArray()
						.filter(({ checked }) => checked).length === 0
				;(input as HTMLInputElement).checked = checked
				setInputStatus(input, checked)
			}
		}
		const updateSilbing = () => {
			// TODO: 原实现此处选择器缺少 `.` 前缀（"textToggleDisplay-before-on"），疑似笔误，保留原样
			$('textToggleDisplay-before-on').each((_, ele) => {
				const $ele = $(ele)
				if ($ele.next('.textToggleDisplay').is(':not(.textToggleDisplay-on)')) {
					$ele.removeClass('textToggleDisplay-before-on')
				}
			})
			$('.textToggleDisplay:not(.textToggleDisplay-on) + .textToggleDisplay-after-on').removeClass(
				'textToggleDisplay-after-on',
			)
			$('.textToggleDisplay-on')
				.prev('.textToggleDisplay')
				.addClass('textToggleDisplay-before-on')
				.end()
				.next('.textToggleDisplay')
				.addClass('textToggleDisplay-after-on')
		}
		$('.textToggleDisplayButtonInput').on('change', ({ target }) => {
			const {
				dataset: { id, radioCancel },
				checked,
			} = target as HTMLInputElement
			const ids = id!.split('$')
			const self = $(target as Element)
			const label = self.closest('.textToggleDisplayButtonLabel')
			const textToggleDisplayTarget = $(
				ids.map((i) => `.textToggleDisplay[data-id="${i}"]`).join(', '),
			)
			const textToggleDisplayButtons = self.closest('.textToggleDisplayButtons')
			const {
				config: { toggleClass, radio },
			} = datasetParser(textToggleDisplayButtons[0]!)
			let toggleClassName =
				typeof toggleClass === 'string' && toggleClass.length > 0 ? toggleClass : 'hidden'
			if (toggleClassName !== 'hidden') {
				textToggleDisplayTarget.removeClass('hidden')
			}
			toggleClassName += ' textToggleDisplay-off'
			if ((radioCancel?.length ?? 0) > 0) {
				label[checked ? 'addClass' : 'removeClass']('on').attr(
					'style',
					cssSanitizer(label.attr(checked ? 'data-style-on' : 'data-style-off')!),
				)
				$(
					textToggleDisplayButtons
						.find('.textToggleDisplayButtonLabel > input')
						.toArray()
						.flatMap(({ dataset: { id } }) => id!.split('$'))
						.map((i) => `.textToggleDisplay[data-id="${i}"]`)
						.join(', '),
				)
					.addClass(toggleClassName)
					.removeClass('textToggleDisplay-on')
			} else {
				textToggleDisplayTarget[checked ? 'removeClass' : 'addClass'](toggleClassName)[
					checked ? 'addClass' : 'removeClass'
				]('textToggleDisplay-on')
				if ((radio?.length ?? 0) > 0 && checked) {
					const siblings = $(
						textToggleDisplayButtons
							.find('.textToggleDisplayButtonLabel > input')
							.not(target as Element)
							.toArray()
							.flatMap(({ dataset: { id } }) => id!.split('$'))
							.map((i) => `.textToggleDisplay[data-id="${i}"]`)
							.join(', '),
					)
					siblings.addClass(toggleClassName).removeClass('textToggleDisplay-on')
				}
			}
			setLabelStatus()
			updateSilbing()
		})
		$('.textToggleDisplayButtonInputReverse').on('change', ({ target }) => {
			const {
				dataset: { id, radioCancel },
				checked,
			} = target as HTMLInputElement
			const ids = id!.split('$')
			const self = $(target as Element)
			const label = self.closest('.textToggleDisplayButtonLabel')
			const textToggleDisplayTarget = $(
				ids.map((i) => `.textToggleDisplay[data-id="${i}"]`).join(', '),
			)
			const textToggleDisplayButtons = self.closest('.textToggleDisplayButtons')
			const {
				config: { toggleClass, radio },
			} = datasetParser(textToggleDisplayButtons[0]!)
			let toggleClassName =
				typeof toggleClass === 'string' && toggleClass.length > 0 ? toggleClass : 'hidden'
			if (toggleClassName !== 'hidden') {
				textToggleDisplayTarget.removeClass('hidden')
			}
			toggleClassName += ' textToggleDisplay-off'
			if ((radioCancel?.length ?? 0) > 0) {
				label[checked ? 'addClass' : 'removeClass']('on').attr(
					'style',
					cssSanitizer(label.attr(checked ? 'data-style-on' : 'data-style-off')!),
				)
				$(
					textToggleDisplayButtons
						.find('.textToggleDisplayButtonLabel > input')
						.toArray()
						.flatMap(({ dataset: { id } }) => id!.split('$'))
						.map((i) => `.textToggleDisplay[data-id="${i}"]`)
						.join(', '),
				)
					.addClass(toggleClassName)
					.removeClass('textToggleDisplay-on')
			} else {
				textToggleDisplayTarget[checked ? 'addClass' : 'removeClass'](toggleClassName)[
					checked ? 'removeClass' : 'addClass'
				]('textToggleDisplay-on')
				if ((radio?.length ?? 0) > 0 && checked) {
					const siblings = $(
						textToggleDisplayButtons
							.find('.textToggleDisplayButtonLabel > input')
							.not(target as Element)
							.toArray()
							.flatMap(({ dataset: { id } }) => id!.split('$'))
							.map((i) => `.textToggleDisplay[data-id="${i}"]`)
							.join(', '),
					)
					siblings.removeClass(toggleClassName).addClass('textToggleDisplay-on')
				}
			}
			setLabelStatus()
			updateSilbing()
		})
		for (const ele of defaultInputs) {
			$(ele).prop('checked', true).trigger('change')
		}
		$(window).on('beforeunload', () => {
			$('.textToggleDisplayButtons input[type=checkbox]').prop('checked', false)
		})
	},
])
