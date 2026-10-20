/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:BilibiliCount?action=history
 */
// oxlint-disable max-depth max-lines-per-function -- 逐层遍历接口返回的数据并一次性渲染，拆分需外提闭包状态，风险大于收益
type DataType =
	| 'view'
	| 'danmaku'
	| 'reply'
	| 'favorite'
	| 'coin'
	| 'share'
	| 'his_rank'
	| 'like'
	| 'dislike'
	| 'title'
type NodesCollection = Partial<Record<DataType, HTMLElement[]>>
type Collection = Record<string, NodesCollection>
interface VideoRecord {
	data: Partial<Record<DataType, number>>
	time: string
	status: string
	message: string
}
interface CollectorResponse {
	error?: string
	requestId?: string
	query: {
		code: number
		videos: Record<string, Record<string, VideoRecord>>
	}
}
interface ViewResponse {
	code: number
	message: string
	data: { stat: Record<string, number> }
}

window.RLQ ??= []
window.RLQ.push([
	['mediawiki.base', 'jquery', 'moment', 'ext.gadget.site-lib'],
	async () => {
		const DEBUGMODE = mw.config.get('wgUserId') === 69859
		const typelist: (DataType | undefined)[] = [
			undefined,
			'view',
			'danmaku',
			'reply',
			'favorite',
			'coin',
			'share',
			'his_rank',
			'like',
			'dislike',
			'title',
		] // 首位undefined减少不必要的减法
		const formats = ['toFixed', 'plain', 'separate']
		const map: { aid: Collection; bvid: Collection } = {
			aid: {},
			bvid: {},
		}
		const getNodes = () => [...document.querySelectorAll<HTMLElement>('.bilibiliCount')]
		const sendError = (
			error:
				| { type: 'network'; information: Response }
				| { type: 'networkException'; information: DOMException }
				| { type: 'error'; information: Error },
		) => {
			console.error('widget:BilibiliCount', error.type, 'occurred:', error.information)
			const nodes = getNodes()
			for (const node of nodes) {
				node.innerHTML = `BilibiliCount ${wgUVS('运行错误', '執行錯誤')}`
			}
			if (error.type === 'network' && error.information.status === 429) {
				nodes[0]!.innerHTML += [
					wgUVS(
						/* BilibiliCount 运行错误 */ '：非常抱歉，但由于过多的请求，现已触发数据统计服务器的临时封禁措施。',
						/* BilibiliCount 執行錯誤 */ '：非常抱歉，但由於過多的請求，現已觸發資料統計伺服器的臨時封鎖措施。',
					),
					wgUVS(
						'这可能是因为您短时间内打开了多个页面进而产生大量请求导致的，请等待1分钟后刷新本页面，并建议您打开相关数据统计页面时每次间隔1分钟，感谢您的合作！',
						'這可能是因為您短時間內打开了多個頁面進而產生大量請求導致的，請等待1分鐘後重新整理本頁面，並建議您開啟相關資料統計頁面時每次間隔1分鐘，感謝您的合作！',
					),
				].join('\n')
				return
			}
			nodes[0]!.innerHTML += '：'
			if (error.type === 'networkException') {
				switch (error.information.name) {
					case 'NetworkError': {
						nodes[0]!.innerHTML += wgUVS('发生网络错误，请检查你的网络。')
						return
					}
					case 'AbortError':
					case 'TimeoutError': {
						nodes[0]!.innerHTML += wgUVS('请求超时，请检查你的网络，或等待一段时间后再试。')
						return
					}
					default: {
						nodes[0]!.innerHTML += `发生网络错误：${error.information.name} - ${error.information.message}`
						return
					}
				}
			}
			const reason: Record<string, unknown> = {
				type: error.type,
			}
			if (error.type === 'network') {
				reason.information = {
					status: error.information.status,
					statusText: error.information.statusText,
				}
			} else {
				reason.information = {
					name: error.information.name,
					message: error.information.message,
				}
				if (error.information.stack) {
					const [, secondLine] = error.information.stack.split('\n')
					;(reason.information as Record<string, unknown>).stack = secondLine
				}
			}
			for (const [k, v] of Object.entries(reason)) {
				nodes[0]!.innerHTML += `\n${k}: ${JSON.stringify(v, undefined, 4)}`
			}
		}
		const clear = () => {
			for (const node of document.querySelectorAll(
				'.bilibiliCount.done[data-bilibili-count-onlyTime="false"][data-bilibili-count-noTime="true"] sub',
			)) {
				node.remove()
			}
			for (const node of document.querySelectorAll<HTMLElement>(
				'.bilibiliCount.done[data-time]:not([data-time=""])[data-bilibili-count-onlyTime="false"][data-bilibili-count-noTime="false"]',
			)) {
				const sub = node.querySelector('sub')
				if (sub) {
					sub.innerText = `(${moment(
						/^\d{12,}$/u.test(node.dataset.time!) ? Number(node.dataset.time!) : node.dataset.time,
					).format(node.dataset.dateFormat || 'LLL')})`
				}
			}
			for (const node of document.querySelectorAll<HTMLElement>(
				'.bilibiliCount.done[data-time]:not([data-time=""])[data-bilibili-count-onlyTime="true"]',
			)) {
				node.innerText = moment(
					/^\d{12,}$/u.test(node.dataset.time!) ? Number(node.dataset.time!) : node.dataset.time,
				).format(node.dataset.dateFormat || 'LLL')
			}
			for (const node of document.querySelectorAll('.bilibiliCount.done')) {
				node.classList.remove('done')
			}
		}
		const setErrorMsg = (node: HTMLElement, ...msg: (string | HTMLElement)[]) => {
			node.innerText = ''
			node.append(...msg)
			node.style.fontStyle = 'italic'
		}
		const ajax = async (input: URL | RequestInfo, init?: RequestInit & { timeout?: number }) => {
			const timeout =
				Number.isSafeInteger(init?.timeout) && init!.timeout! > 0 ? init!.timeout! : 60000
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), timeout)
			const response = await fetch(input, {
				...(init ?? {}),
				signal: controller.signal,
			}).catch((e: unknown) =>
				e instanceof DOMException
					? e
					: new DOMException(JSON.stringify(e, null, 4), 'UnknownError'),
			)
			clearTimeout(timeoutId)
			return response
		}
		// eslint-disable-next-line no-unused-vars
		const getFreshData = async (prefix: 'aid' | 'bvid', id: string) => {
			try {
				const funcName = `jsonp_${Math.random()}`.slice(2)
				const url = new URL('https://api.bilibili.com/x/web-interface/view?jsonp=jsonp')
				url.searchParams.set(prefix, id)
				const script = document.createElement('script')
				script.src = `${url}`
				const {
					code,
					message,
					data: { stat },
				} = await new Promise<ViewResponse>((res, rej) => {
					script.addEventListener('error', (e) => {
						// oxlint-disable-next-line typescript/prefer-promise-reject-errors -- 原样抛出事件对象，保持既有错误信息
						rej(e)
					})
					script.addEventListener('abort', (e) => {
						// oxlint-disable-next-line typescript/prefer-promise-reject-errors -- 原样抛出事件对象，保持既有错误信息
						rej(e)
					})
					document.head.append(script)
					;(window as unknown as Record<string, unknown>)[funcName] = res
				}).finally(() => {
					script.remove()
				})
				if (code === 0) {
					return Object.fromEntries(
						Object.entries(stat).filter(([key]) => typelist.includes(key as DataType)),
					) as Record<DataType, number>
				}
				console.info('Widget:BilibiliVideo', `${prefix}${id}`, code, message)
			} catch (e) {
				console.info('Widget:BilibiliCount', `${prefix}${id}`, e)
			}
			return null
		}
		// oxlint-disable-next-line complexity -- 逐字段解析并渲染的逻辑与线上 Widget 保持一致，拆分反而增加回归风险
		const get = async (type: 'aid' | 'bvid', ids: string[]) => {
			const url = new URL(
				' https://cors.funce.dev/https://moegirlpedia.annangela.cn/bilibiliCollector/video',
			)
			url.searchParams.set(type, ids.join('|'))
			const response = await ajax(url, {
				method: 'GET',
			})
			if (response instanceof DOMException) {
				sendError({
					type: 'networkException',
					information: response,
				})
				// oxlint-disable-next-line no-throw-literal typescript/only-throw-error -- 以 false 作为“已处理错误”的哨兵值，外层 catch 依赖该判断
				throw false
			}
			if (!response.ok) {
				sendError({
					type: 'network',
					information: response,
				})
				// oxlint-disable-next-line no-throw-literal typescript/only-throw-error -- 以 false 作为“已处理错误”的哨兵值，外层 catch 依赖该判断
				throw false
			}
			const responseData = (await response.json()) as CollectorResponse
			for (const [prefix, collection] of Object.entries(responseData.query.videos) as [
				keyof typeof map,
				Record<string, VideoRecord>,
			][]) {
				for (const [id, data] of Object.entries(collection)) {
					for (const [type, nodes] of Object.entries(map[prefix][id]!) as [
						DataType,
						HTMLElement[],
					][]) {
						for (const node of nodes) {
							if (responseData.error || responseData.query.code !== 0) {
								setErrorMsg(
									node,
									`(${wgUVS('请求数据出错', '請求資料出錯')}${responseData.requestId ? `，requestId ${responseData.requestId}` : ''})`,
								)
								if (DEBUGMODE) {
									node.title = `[${prefix}${id}]:\n${JSON.stringify(data, undefined, 4)}`
								}
								continue
							}
							const rawValue = data.data[type]
							if (
								typeof rawValue === 'undefined' ||
								// @ts-expect-error 接口约定计数为数字，但沿用旧有的空字符串判断
								rawValue === ''
							) {
								setErrorMsg(
									node,
									`(${prefix}${id}[${type}] ${wgUVS('无数据', '無資料')}${responseData.requestId ? `，requestId ${responseData.requestId}` : ''})`,
								)
								continue
							}
							let format = node.dataset.format as 'toFixed' | 'plain' | 'separate'
							let value: number | string
							if (!formats.includes(format)) {
								format = 'toFixed'
							}
							let decimalLength = parseInt(node.dataset.decimalLength!, 10)
							if (!Number.isInteger(decimalLength) || decimalLength < 1) {
								decimalLength = 2
							}
							switch (format) {
								case 'toFixed':
									if (!/\D/u.test(`${rawValue}`) && rawValue > 10000) {
										value = `${(rawValue / 10000).toFixed(Number.isInteger(decimalLength) ? decimalLength : 2)}${wgUVS('万', '萬')}`
									} else {
										value = rawValue
									}
									break
								case 'plain':
									value = rawValue
									break
								case 'separate':
									value = `${rawValue}`
										.split('')
										.reverse()
										.map((digit, index) => (index > 0 && index % 3 === 0 ? `${digit},` : digit))
										.reverse()
										.join('')
									break
							}
							node.innerHTML = `<span>${value}</span><sub></sub>`
							node.dataset.time = data.time
							node.classList.add('done')
							if (data.status !== 'ok') {
								node.style.textDecoration = 'underline'
								if (!DEBUGMODE) {
									node.title = `${wgUVS('无法获取最新数据', '無法獲取最新資料')}：${data.status} - ${data.message}`
								}
							}
							if (DEBUGMODE) {
								node.title = `onlineResult[${id}]:\n${JSON.stringify({ ...data, requestId: responseData.requestId }, undefined, 4)}`
							}
						}
					}
				}
			}
			if (responseData.error || responseData.query.code !== 0) {
				console.error('WidgetBilibiliCount', responseData)
			}
			// clear();
		}
		try {
			const dislikeDocLink = new URL('https://zh.moegirl.org.cn/Template:BilibiliCount')
			dislikeDocLink.hash = '参数说明'
			for (const node of getNodes()) {
				const rawId = node.dataset.bilibiliCountId!
				const id = rawId.replace(/^[ab]v/iu, '')
				let type: DataType | undefined = (node.dataset.bilibiliCountType || '1') as DataType
				let prefix: 'aid' | 'bvid'
				if (/^(?:av)?[1-9]\d{0,8}$/iu.test(rawId)) {
					prefix = 'aid'
				} else if (
					/(?:(?:[bB][vV])?1)?[fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{9}/iu.test(
						rawId,
					)
				) {
					prefix = 'bvid'
				} else {
					setErrorMsg(node, wgUVS('(参数 id 错误)', '(引數 id 錯誤)'))
					continue
				}
				if (/^\d+$/u.test(type)) {
					type = typelist[Number(type)]
				}
				if (!typelist.includes(type) || !type) {
					setErrorMsg(node, wgUVS('(参数 type 错误)', '(引數 type 錯誤)'))
					continue
				}
				if (type === 'dislike') {
					const link = document.createElement('a')
					link.href = `${dislikeDocLink}`
					link.target = '_blank'
					link.classList.add('external', 'free')
					link.innerText = wgUVS(
						'dislike（差评）参数已被停用，详情请见模板说明页',
						'dislike（差評）引數已被停用，詳情請見模板說明頁',
					)
					setErrorMsg(node, link)
					continue
				}
				if (!Reflect.has(map[prefix], id)) {
					map[prefix][id] = {}
				}
				const collection = map[prefix][id]!
				if (!Array.isArray(collection[type])) {
					collection[type] = []
				}
				collection[type]!.push(node)
				node.innerHTML = `<i>${wgUVS('加载中', '載入中')}……</i>`
			}
			clear()
			for (const [type, arr] of Object.entries(map)
				.map(([type, obj]) => [type, Object.keys(obj)] as [string, string[]])
				.filter(([, { length }]) => length > 0)) {
				for (let i = 0; i * 30 < arr.length; i++) {
					// oxlint-disable-next-line no-await-in-loop -- 刻意串行请求，避免触发接口限流
					await get(type as 'aid' | 'bvid', arr.slice(i * 30, i * 30 + 30))
				}
			}
		} catch (e) {
			if (e !== false) {
				sendError({
					type: 'error',
					information: e as Error,
				})
			}
		}
	},
])
