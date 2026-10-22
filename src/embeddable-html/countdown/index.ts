/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Countdown?action=history
 */

import type { ResourceLoaderQueue } from '~/@types/rlq'

// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= [] as unknown as ResourceLoaderQueue).push([
	['moment'],
	() => {
		// oxlint-disable-next-line complexity -- 年月日时分秒的逐级借位是刻意展开的
		const fromNow = (then: moment.Moment, before: string, after: string, on: string) => {
			const now = moment()
			const isBefore = then.isBefore(now)
			const monthsHave31Days = [0, 2, 4, 6, 7, 9, 11] // 月份从0开始
			let year = isBefore ? now.year() - then.year() : then.year() - now.year(),
				month = isBefore ? now.month() - then.month() : then.month() - now.month(),
				day = isBefore ? now.date() - then.date() : then.date() - now.date(),
				hour = isBefore ? now.hour() - then.hour() : then.hour() - now.hour(),
				minute = isBefore ? now.minute() - then.minute() : then.minute() - now.minute(),
				second = isBefore ? now.second() - then.second() : then.second() - now.second()
			if (second < 0) {
				minute--
				second += 60
			}
			if (minute < 0) {
				hour--
				minute += 60
			}
			if (hour < 0) {
				day--
				hour += 24
			}
			if (day < 0) {
				month--
				if (monthsHave31Days.includes((isBefore ? then : now).month())) {
					day += 31
				} else if ((isBefore ? then : now).month() === 1) {
					if ((isBefore ? then : now).year() % 4 === 0) {
						day += 29
					} else {
						day += 28
					}
				} else {
					day += 30
				}
			}
			if (month < 0) {
				year--
				month += 12
			}
			let result = ''
			if (year > 0) {
				result += `${year}年`
			}
			if (month > 0) {
				result += `${month}月`
			} else if (result !== '') {
				result += `0月`
			}
			if (day > 0) {
				result += `${day}日`
			} else if (result !== '') {
				result += `0日`
			}
			if (hour > 0) {
				result += `${hour}小时`
			} else if (result !== '') {
				result += `0小时`
			}
			if (minute > 0) {
				result += `${minute}分`
			} else if (result !== '') {
				result += `0分`
			}
			if (second > 0) {
				result += `${second}秒`
			} else if (result !== '') {
				result += `0秒`
			}
			return (result === '' ? on : isBefore ? before : after).replace(
				'$1',
				result.replace(/(\d) /gu, '$1'),
			)
		}
		const run = () => {
			$('.countdownNode:not(.disabled)').each((_, ele) => {
				const self = $(ele)
				self.text(
					fromNow(
						self.data('target') as moment.Moment,
						ele.dataset.before || '$1前',
						ele.dataset.after || '还剩$1',
						ele.dataset.on || '就是现在！',
					),
				)
			})
		}
		$('.countdownNode').each((_, ele) => {
			const self = $(ele),
				time = moment(ele.dataset.target)
			if (!time.isValid()) {
				self.addClass('error disabled').text('（发生了致命错误！）')
				return
			}
			self.data('target', time)
		})
		run()
		window.setInterval(run, 1000)
	},
])
