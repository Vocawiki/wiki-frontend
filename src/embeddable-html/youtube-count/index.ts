/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:YoutubeCount?action=history
 */
// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
interface VideoRecord {
	data: Record<string, number | string>
	time: string
	status: string
	message: string
}
interface CollectorResponse {
	error?: string
	requestId?: string
	query: {
		code: number
		videos: Record<string, VideoRecord>
	}
}
interface ErrorReport {
	type: string
	information: Record<string, unknown>
	[key: string]: unknown
}
/** jQuery 集合在运行时借用了 Array.prototype 的 push，但类型声明里没有 */
type NodeCollection = JQuery & { push: (...elements: HTMLElement[]) => number }

window.RLQ ??= []
window.RLQ.push([
	['moment', 'jquery', 'mediawiki.base'],
	async () => {
		await $.ready
		const DEBUGMODE = mw.config.get('wgUserId') === 69859
		const typelist = [
			'publishedAt',
			'title',
			'privacyStatus',
			'publicStatsViewable',
			'viewCount',
			'likeCount',
			'commentCount',
		]
		const formats = ['toFixed', 'plain', 'separate']
		const map: Record<string, Record<string, NodeCollection>> = {}
		const helper = {
			sendError: (error: ErrorReport) => {
				console.error('widget:YoutubeCount', error.type, 'occurred:', error.information)
				let t = ''
				// oxlint-disable-next-line guard-for-in -- 错误对象由本文件自行构造，无原型链污染风险
				for (const i in error) {
					t += `\n${i}: ${JSON.stringify(error[i], undefined, 4)}`
				}
				if (error.type === 'network' && error.information.status === 429) {
					$('.youtubeCount').html(
						`${wgUVS('YoutubeCount 运行错误：非常抱歉，但由于过多的请求，现已触发数据统计服务器的临时封禁措施。', 'YoutubeCount 執行錯誤：非常抱歉，但由於過多的請求，現已觸發資料統計伺服器的臨時封鎖措施。')}\n${wgUVS('这可能是因为您短时间内打开了多个页面进而产生大量请求导致的，请等待1分钟后刷新本页面，并建议您打开相关数据统计页面时每次间隔1分钟，感谢您的合作！', '這可能是因為您短時間內打开了多個頁面進而產生大量請求導致的，請等待1分鐘後重新整理本頁面，並建議您開啟相關資料統計頁面時每次間隔1分鐘，感謝您的合作！')}`,
					)
				} else {
					$('.youtubeCount').html(`YoutubeCount ${wgUVS('运行错误', '執行錯誤')}：${t}`)
				}
			},
			format: (rawValue: unknown, t: string, f: string, d = 2) => {
				const text = String(rawValue)
				let r: string
				switch (t) {
					case 'value':
						switch (f) {
							case 'toFixed':
								if (/\D/u.test(text)) {
									r = text
								} else {
									const n = Number(text)
									if (n > 10 ** 8) {
										r = `${(n / 10 ** 8).toFixed(Number.isInteger(d) ? d : 2)}${wgUVS('亿', '億')}`
									} else if (n > 10 ** 4) {
										r = `${(n / 10 ** 4).toFixed(Number.isInteger(d) ? d : 2)}${wgUVS('万', '萬')}`
									} else {
										r = text
									}
								}
								break
							case 'plain':
								r = text
								break
							case 'separate':
								r = text
									.split('')
									.reverse()
									.map((digit, index) => (index > 0 && index % 3 === 0 ? `${digit},` : digit))
									.reverse()
									.join('')
								break
							default:
								r = text
						}
						break
					case 'date':
						r = moment(/^\d{12,}$/u.test(text) ? Number(text) : text).format(f)
						break
					default:
						r = text
				}
				return r
			},
			clear: () => {
				$(
					'.youtubeCount.done[data-youtube-count-onlyTime="false"][data-youtube-count-noTime="true"] sub',
				).remove()
				$(
					'.youtubeCount.done[data-time]:not([data-time=""])[data-youtube-count-onlyTime="false"][data-youtube-count-noTime="false"]',
				).each((_, ele) => {
					$(ele)
						.find('sub')
						.text(`(${helper.format(ele.dataset.time, 'date', ele.dataset.dateFormat || 'LLL')})`)
				})
				$(
					'.youtubeCount.done[data-time]:not([data-time=""])[data-youtube-count-onlyTime="true"]',
				).each((_, ele) => {
					$(ele).text(helper.format(ele.dataset.time, 'date', ele.dataset.dateFormat || 'LLL'))
				})
				$('.youtubeCount.done').removeClass('done')
			},
			get: (arr: string[]) =>
				$.ajax({
					url: `https://cors.funce.dev/https://moegirlpedia.annangela.cn/youtubeCollector/video?target=${arr.join('|')}`,
					type: 'GET',
					timeout: 60000,
					success: (d: CollectorResponse) => {
						// oxlint-disable-next-line guard-for-in -- 接口返回的纯 JSON 对象，无原型链污染风险
						for (const id in d.query.videos) {
							const data = d.query.videos[id]!
							// oxlint-disable-next-line guard-for-in -- 同上，map 为本地构造的普通对象
							for (const type in map[id]) {
								// oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- noUncheckedIndexedAccess 下索引访问确实可能为 undefined，规则误报
								const nodes = map[id]![type]!
								if (d.error || d.query.code !== 0) {
									nodes
										.empty()
										.text(
											`(${wgUVS('请求数据出错', '請求資料出錯')}${d.requestId ? `，requestId ${d.requestId}` : ''})`,
										)
										.css('font-style', 'italic')
									continue
								}
								// oxlint-disable-next-line typescript/no-unnecessary-condition -- 接口异常时可能缺少 data 字段，需保留旧有的防御判断
								if (!data.data) {
									nodes
										.empty()
										.append(
											`<span>(${id} ${wgUVS('无数据', '無資料')}${d.requestId ? `，requestId ${d.requestId}` : ''})</span>`,
										)
										.css('font-style', 'italic')
									continue
								}
								if (type !== 'publishedAt' && /\D/u.test(String(data.data[type]))) {
									data.data[type] = wgUVS('无数据', '無資料')
								}
								nodes.empty().each((_, ele) => {
									let format = ele.dataset.format
									const dateFormat = ele.dataset.dateFormat || 'LLL'
									if (!formats.includes(format!)) {
										format = 'toFixed'
									}
									let decimalLength = parseInt(ele.dataset.decimalLength!, 10)
									if (!Number.isInteger(decimalLength) || decimalLength < 1) {
										decimalLength = 2
									}
									$(ele)
										.append(
											`<span>${helper.format(
												data.data[type],
												type === 'publishedAt' ? 'date' : 'value',
												type === 'publishedAt'
													? dateFormat
													: type.endsWith('Count')
														? format!
														: 'plain',
												decimalLength,
											)}</span><sub></sub>`,
										)
										.attr('data-time', data.time)
								})
								nodes.addClass('done')
								if (data.status !== 'ok') {
									nodes.css('text-decoration', 'underline')
									if (!DEBUGMODE) {
										nodes.attr(
											'title',
											`${wgUVS('无法获取最新数据', '無法獲取最新資料')}：${data.status} - ${data.message}`,
										)
									}
								}
								if (DEBUGMODE) {
									nodes
										.attr(
											'title',
											`onlineResult[${id}]:\n${JSON.stringify({ ...data, requestId: d.requestId }, undefined, 4)}`,
										)
										.addClass('done')
								}
							}
						}
						if (d.error || d.query.code !== 0) {
							console.error('WidgetYoutubeCount', d)
						}
						// helper.clear();
					},
					error: (e) => {
						helper.sendError({
							type: 'network',
							information: {
								readyState: e.readyState,
								state: e.state(),
								responseText: e.responseText,
								status: e.status,
								statusText: e.statusText,
							},
						})
					},
				}),
		}
		try {
			$('.youtubeCount').each((_, ele) => {
				const self = $(ele)
				const id = ele.dataset.youtubeCountId
				let type = ele.dataset.youtubeCountType
				if (!/^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/u.test(id || '')) {
					self.empty().text(wgUVS('(参数 id 错误)', '(引數 id 錯誤)')).css('font-style', 'italic')
					return
				}
				if (!typelist.includes(type!)) {
					type = undefined
				}
				if (!type) {
					self
						.empty()
						.text(wgUVS('(参数 type 错误)', '(引數 type 錯誤)'))
						.css('font-style', 'italic')
					return
				}
				if (!$.isPlainObject(map[id!])) {
					map[id!] = {}
				}
				const collection = map[id!]!
				if (!collection[type] || collection[type]!.jquery !== $.fn.jquery) {
					collection[type] = $() as NodeCollection
				}
				collection[type]!.push(ele)
				self.html(`<i>${wgUVS('加载中', '載入中')}……</i>`)
			})
			helper.clear()
			const targets = Object.keys(map).filter((key) =>
				Object.entries(map[key]!).some(([, { length }]) => length > 0),
			)
			for (let i = 0; i * 20 < targets.length; i++) {
				// oxlint-disable-next-line no-await-in-loop -- 刻意串行请求，避免触发接口限流
				await helper.get(targets.slice(i * 20, i * 20 + 20))
			}
		} catch (e) {
			helper.sendError({
				type: 'throw_error',
				information: {
					name: (e as Error).name,
					message: (e as Error).message,
					stack: (e as Error).stack?.split('\n')[1]!.trim(),
				},
			})
		}
	},
])
