import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		const app = $('.echart-app')
		if (!app[0]) {
			return
		}
		const scripts = {
			debug: 'https://npm.elemecdn.com/echarts@5/dist/echarts.js',
			min: 'https://npm.elemecdn.com/echarts@5/dist/echarts.min.js',
		}
		const needDebug = $('.echart-app[data-debug="true"]').length > 0
		const script = document.createElement('script')
		script.src = scripts[needDebug ? 'debug' : 'min']
		script.addEventListener('load', () => {
			app.each((_, ele) => {
				const self = $(ele)
				try {
					// 配置结构由页面内的 JSON 决定，这里只声明用到的字段
					const data = JSON.parse(self.find('.echart-data').text()) as {
						tooltip?: Record<string, unknown>
					}
					if ($.isPlainObject(data.tooltip)) {
						data.tooltip!.renderMode = 'richText'
					}
					const chartNode = self.find('.echart-main')
					// TODO: 原实现用 const 声明后又重新赋值（会抛错并被 catch 吞掉），这里改为 let 以保留原意
					let width = parseInt(ele.dataset.width!, 10)
					let height = parseInt(ele.dataset.height!, 10)
					if (width <= 160) {
						width = 1200
					}
					if (height <= 90) {
						height = 675
					}
					chartNode.width(width).height(height)
					echarts.init(chartNode[0]!).setOption(data)
				} catch (e) {
					self.text(`${String(e)}\n${(e as Error).stack?.split('\n').slice(1).join('\n')}`)
				}
			})
		})
		document.body.append(script)
	},
])
