// oxlint-disable max-lines-per-function -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(window.RLQ ??= []).push([
	'jquery',
	async () => {
		await $.ready
		if ($('#mw-daily-catlinks').length) return
		interface SongSubmission {
			date: { year: number; month: number; day: number }
			platform?: { name: string }
		}
		const targetPlatforms = ['niconico', 'YouTube', 'bilibili', 'AcFun', 'SoundCloud']
		const data = $('.songbox_submission[data-json]')
			.toArray()
			.map((ele) => JSON.parse(ele.dataset.json!) as SongSubmission)
			.filter((item) => targetPlatforms.includes(item.platform?.name ?? ''))
		if (!data.length) return

		const $container = $('#catlinks')
		const $normalSection = $container.find('#mw-normal-catlinks')
		const $ul = $normalSection.find('ul')
		const createCategoryItem = (dataItem: {
			year: number
			month: number
			day: number
			name: string
		}) => {
			const $li = $('<li>')

			// 平台图标
			let src = ''
			switch (dataItem.name) {
				case 'niconico':
					src = '/images/e/e0/Niconico_Logo_%282020%29.svg'
					break
				case 'YouTube':
					src = '/images/6/60/YouTube_Icon_Red.svg'
					break
				case 'bilibili':
					src = '/images/9/9b/Bilibili_favicon.svg'
					break
				case 'AcFun':
					src = '/images/7/7b/AcFun_icon.png'
					break
				case 'SoundCloud':
					src = '/images/2/2d/SoundCloud_icon.svg'
					break
			}
			const $img = $('<img>', {
				src,
				decoding: 'async',
				width: 15,
				height: 15,
				class: 'mw-file-element',
				'data-file-width': 512,
				'data-file-height': 512,
			}).css({
				width: '15px',
				height: '15px',
			})

			// 年份部分
			const yearText = `${dataItem.year}年`
			const $yearLink = $('<a>', {
				href: `/Category:${encodeURIComponent(`${yearText}投稿至${dataItem.name}的歌曲`)}`,
				title: `Category:${yearText}投稿至${dataItem.name}的歌曲`,
				text: yearText,
			})

			const monthDayText = `${dataItem.month}月${dataItem.day}日`
			const $monthDayLink = $('<a>', {
				href: `/Category:${encodeURIComponent(`${dataItem.month}月${dataItem.day}日投稿至${dataItem.name}的歌曲`)}`,
				title: `Category:${monthDayText}投稿至${dataItem.name}的歌曲`,
				text: monthDayText,
			})

			$li.append($img, $yearLink, $monthDayLink)
			return $li
		}

		// 去除日期分类
		const dateRegex = /^(20\d{2}年|1?\d月[123]?\d日)投稿至.+的歌曲$/u
		$ul
			.children('li')
			.filter(function () {
				return dateRegex.test($(this).text())
			})
			.remove()

		// 重建日期分类
		const $div = $('<div>', {
			id: 'mw-daily-catlinks',
			class: 'mw-daily-catlinks',
		})
		const $list = $('<ul>')
		data.forEach((item) => {
			const dataItem = {
				year: item.date.year,
				month: item.date.month,
				day: item.date.day,
				name: item.platform!.name,
			}
			const $li = createCategoryItem(dataItem)
			if ($list.children().filter((_, el) => $(el).html() === $li.html()).length > 0) return
			$list.append($li)
		})

		$normalSection.after($div.append(`日期${wgULS('分类', '分類')}：&ZeroWidthSpace;`, $list))
	},
])
