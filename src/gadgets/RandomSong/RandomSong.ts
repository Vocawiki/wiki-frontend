import { LocalCache } from './LocalCache'

interface ApiQueryRandomResponse {
	query: {
		pages: {
			[key: string]: {
				title: string
				categories: {
					title: string
				}[]
			}
		}
	}
}

type NonEmptyArray<T> = [T, ...T[]]

declare global {
	interface Window {
		gadgetRandomSongCache: NonEmptyArray<string> | undefined
	}
}
const CACHE_KEY = 'gadget-randomsong-cache'
const CACHE_TTL = 86400 * 1000 // 缓存1天

async function apiGetRandomSongs() {
	const retryCount = 3
	const searchCount = 30
	const api = new mw.Api()

	let rCount = retryCount
	try {
		while (rCount--) {
			const result = (await api.get({
				action: 'query',
				generator: 'random',
				grnnamespace: 0,
				grnlimit: searchCount,
				prop: 'categories',
				cllimit: 'max',
			})) as ApiQueryRandomResponse

			const pages = Object.values(result.query.pages).filter((page) =>
				page.categories.some((cat) => cat.title.endsWith('歌曲')),
			)
			if (pages.length > 0) {
				return pages.map((page) => page.title) as NonEmptyArray<string>
			}
		}
	} catch (e) {
		mw.notify(wgULS('网络连接出错', '網路連接出錯', null, null, '網絡連接出錯'), { type: 'error' })
		console.error('网络/API错误:', e)
	}
	return null
}

async function updateCache() {
	// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
	const songs = LocalCache.get<NonEmptyArray<string>>(CACHE_KEY) || (await apiGetRandomSongs())
	if (songs) {
		LocalCache.set(CACHE_KEY, songs, CACHE_TTL)
		window.gadgetRandomSongCache = songs
		return true
	}
	return false
}

function getSong(): string {
	const songs = window.gadgetRandomSongCache!
	const song = songs.pop()!
	if (songs.length === 0) {
		LocalCache.remove(CACHE_KEY)
		void updateCache()
	} else {
		LocalCache.set(CACHE_KEY, songs, CACHE_TTL)
	}
	return song
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
$(async () => {
	const $link = $('#n-随机歌曲 a')
	if (await updateCache()) {
		$link.on('mousedown', () => {
			$link.attr('href', mw.util.getUrl(getSong()))
		})
	}
})
