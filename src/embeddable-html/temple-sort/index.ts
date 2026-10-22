/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:TempleSort?action=history
 */

import type { ResourceLoaderQueue } from '~/@types/rlq'

;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	[],
	() => {
		// jQuery 的 each 回调不允许返回 Promise，故以 void 调用 async 函数，执行时序与原实现一致
		const sortTemple = async (ele: HTMLElement) => {
			const type = ele.dataset.type
			const className =
				type && ['n', 'b', 'y'].includes(type)
					? (
							{ n: '.niconicoCount', b: '.bilibiliCount', y: '.youtubeCount' } as Record<
								string,
								string
							>
						)[type]!
					: '.niconicoCount'
			const sleep = (time: number) => new Promise((res) => setTimeout(res, time))
			let notDone = $(`${className}:not(.done)`)
			while (notDone.length) {
				// oxlint-disable-next-line no-await-in-loop -- 需按顺序轮询，等待站内脚本完成计数渲染
				await sleep(100)
				notDone = $(`${className}:not(.done)`)
			}
			const cards = $(ele).parents('div').first().find('.famed-song-card').has(className)
			const styles = cards.prev()
			if (cards.length === 0) return
			// jQuery 集合继承 Array.prototype.sort（原地排序并返回自身），但类型定义中未声明 sort
			;(cards as unknown as HTMLElement[]).sort((a, b) => {
				const aCount = parseFloat($(a).find(className).text().replace(/,/gu, ''))
				const bCount = parseFloat($(b).find(className).text().replace(/,/gu, ''))
				return bCount - aCount
			})
			styles.after((i) => cards[i]!)
		}
		$('.temple-sort-type').each((_, ele) => {
			void sortTemple(ele)
		})
	},
])
