// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
window.RLQ ??= []
window.RLQ.push([
	'jquery',
	() => {
		const sort = (() => {
			const chinesenumSort = (() => {
				const normalizationList: Record<string, string> = {
					一: '1',
					二: '2',
					三: '3',
					四: '4',
					五: '5',
					六: '6',
					七: '7',
					八: '8',
					九: '9',
				}
				function alphanum(a: string, b: string) {
					function chunkify(t: string) {
						const tz: string[] = []
						let x = 0,
							y = -1,
							n = false,
							i,
							j
						while (((i = (j = t.charAt(x++)).charCodeAt(0)), Boolean(i))) {
							const m = i === 46 || (i >= 48 && i <= 57)
							if (m !== n) {
								tz[++y] = ''
								n = m
							}
							tz[y] += j
						}
						return tz
					}
					const aa = chunkify(a)
					const bb = chunkify(b)
					for (let x = 0; aa[x] && bb[x]; x++) {
						if (aa[x] !== bb[x]) {
							const c = Number(aa[x]),
								d = Number(bb[x])
							if (c === Number(aa[x]) && d === Number(bb[x])) {
								return c - d
							}
							return aa[x]! > bb[x]! ? 1 : -1
						}
					}
					return aa.length - bb.length
				}
				function chineseNorm(_title: string) {
					let title = _title
						.replace(/([一二三四五六七八九])十([一二三四五六七八九])/gu, '$1$2')
						.replace(/十(?=[一二三四五六七八九])/gu, '1')
						.replace(/十/gu, '10')
					title = title.replace(/[一二三四五六七八九]/gu, (c) => normalizationList[c]!)
					return title
				}
				return function chinesenumSort(a: string, b: string) {
					const na = chineseNorm(a)
					const nb = chineseNorm(b)
					return alphanum(na, nb)
				}
			})()
			const proposalSort = (() => {
				const methods = ['setFullYear', 'setMonth', 'setDate']
				const nowTime = new Date().getTime()
				function parse($ele: JQuery<Element>, cB?: boolean) {
					const text = $ele.text()
					const isPinned = text.startsWith('【置顶】')
					if (!text) {
						return -1
					}
					const date = new Date(0)
					const match = Array.from(text.match(/\((\d{4}\.\d{1,2}\.\d{1,2})\)/u) ?? [])
					if (!match[1]) {
						return -1
					}
					match[1].split('.').forEach((_v, i) => {
						const v = Number(_v)
						;(date as unknown as Record<string, (value: number) => void>)[methods[i]!]!(
							i === 1 ? v - 1 : v,
						)
					})
					if (cB && (isPinned || date.getTime() > nowTime - 7 * 24 * 60 * 60 * 1000)) {
						$ele.css('font-weight', '700')
					}
					return { time: date.getTime(), isPinned }
				}
				return function proposalSort(a: JQuery<Element>, b: JQuery<Element>, cB?: boolean) {
					const { time: aT, isPinned: aP } = parse(a, cB) as { time: number; isPinned: boolean }
					const { time: bT, isPinned: bP } = parse(b, cB) as { time: number; isPinned: boolean }
					if (cB) {
						if (aP && !bP) {
							return -1
						}
						if (!aP && bP) {
							return 1
						}
					}
					return aT - bT
				}
			})()
			return function sort(a: Element, b: Element, t: string, cB?: boolean) {
				switch (t) {
					case 'chinesenum':
						return chinesenumSort($(a).text(), $(b).text())
					case 'proposal':
						return proposalSort($(a), $(b), cB)
					default:
						throw new ReferenceError('Widget:SortSubpageList: Type is not defined')
				}
			}
		})()
		$('.subpagelist').each((_, ele) => {
			const $table = $(ele)
			// oxlint-disable-next-line prefer-destructuring -- jQuery 对象并非可迭代对象，数组解构会抛错，保留索引访问
			const config = $table.find('.subpagelistConfig')[0]
			const $list = $table.find('.mw-prefixindex-list')
			const list = $list.find('li').toArray()
			if (config?.dataset) {
				if (config.dataset.sort) {
					list.sort((a, b) => sort(a, b, config.dataset.sort!, config.dataset.closeBolb === 'true'))
				}
				if (config.dataset.blueborder) {
					const table = $('<table/>')
					table.addClass('mw-prefixindex-list-table')
					list.forEach((li, idx) => {
						if (idx % 3 === 0) {
							$('<tr/>').appendTo(table)
						}
						$('<td/>').append($(li).children()).appendTo(table.find('tr').last())
					})
					const lastRow = table.find('tr').last()
					const l = 3 - lastRow.find('td').length
					for (let i = 0; i < l; i++) {
						lastRow.append('<td/>')
					}
					$table.append(table)
					$list.remove()
				} else {
					list.forEach((li) => {
						$list.append(li)
					})
					if (config.dataset.noAdditionalLineBreak === 'true') {
						const l = 3 - (list.length % 3)
						for (let i = 0; i < l; i++) {
							$list.append('<br>') // 黑科技，用 <br> 来调整
						}
					}
				}
			}
		})
	},
])
