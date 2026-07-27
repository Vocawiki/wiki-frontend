import type { NonEmptyTuple } from 'type-fest'

import { LocalCache } from './LocalCache'

interface ApiQueryRandomResponse {
	query: {
		pages: Record<
			string,
			{
				title: string
				categories: {
					title: string
				}[]
			}
		>
	}
}

const CACHE_KEY = 'gadget-randomsong-cache'
const CACHE_TTL = 86400 * 1000 // 缓存1天
const RETRY_COUNT = 3
const SEARCH_COUNT = 30

async function apiGetRandomSongs() {
	const api = new mw.Api()

	let rCount = RETRY_COUNT
	try {
		while (rCount--) {
			const result = (await api.get({
				action: 'query',
				generator: 'random',
				grnnamespace: 0,
				grnlimit: SEARCH_COUNT,
				prop: 'categories',
				cllimit: 'max',
			})) as ApiQueryRandomResponse

			const pages = Object.values(result.query.pages).filter((page) =>
				page.categories.some(({ title }) => title.endsWith('歌曲')),
			)
			if (pages.length > 0) {
				return pages.map((page) => page.title) as readonly string[] as NonEmptyTuple<string>
			}
		}
	} catch (e) {
		mw.notify(wgULS('网络连接出错', '網路連接出錯', null, null, '網絡連接出錯'), { type: 'error' })
		console.error('网络/API错误:', e)
	}
	return null
}

async function getSong(): Promise<string | null> {
	let songs = LocalCache.get<NonEmptyTuple<string>>(CACHE_KEY)
	if (!songs) {
		songs = await apiGetRandomSongs()
		LocalCache.set(CACHE_KEY, songs, CACHE_TTL)
		if (!songs) return null
	}

	const [song, ...remainSongs] = songs
	if (remainSongs.length === 0) {
		LocalCache.remove(CACHE_KEY)
	} else {
		LocalCache.set(CACHE_KEY, remainSongs, CACHE_TTL)
	}

	return song
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
$(async () => {
	const $link = $('#n-sidebar-random-song a')

	const song = await getSong()
	if (song === null) return

	$link.on('mousedown', () => {
		$link.attr('href', mw.util.getUrl(song))
	})
})
