/** 无色透名祭参与作品分类 */
const PARTICIPATION_CATEGORY = 'Category:无色透名祭活动参与作品'
/** 本届最多展示的曲目数 */
export const CURRENT_LIMIT = 12
/** 往届最多展示的曲目数 */
const PAST_LIMIT = 6
/** 往届的届次 */
const PAST_EDITIONS = [1, 2, 3] as const
/** 本届的届次 */
const CURRENT_EDITION = 4

/** 本届参赛曲数 */
export const SUBMITTED_COUNT = 4410
/** “全部曲目”按钮指向的niconico标签页 */
export const PARTICIPATION_TAG_URL = `https://www.nicovideo.jp/tag/無色透名祭4参加曲?sort=viewCount&order=asc&kind=channel&genre=music_sound`
/** 活动官网 */
export const OFFICIAL_SITE_URL = 'https://site.nicovideo.jp/mushokutomeisai'
/** 本活动主条目 */
export const MAIN_ARTICLE = '无色透名祭'
/** 参与作品分类的站内链接 */
export const PARTICIPATION_CATEGORY_LINK = `:${PARTICIPATION_CATEGORY}`

const API_URL = 'https://voca.wiki/api.php'
const USER_AGENT = 'Vocawiki-frontend/1.0 (+https://github.com/Vocawiki/wiki-frontend)'
const TIMEOUT_MS = 20_000
/** 单次查询最多跟随的续页数，避免接口异常时无限翻页 */
const MAX_API_PAGES = 10
/** 查询页面信息时每批的标题数，避免URL过长 */
const TITLE_BATCH_SIZE = 40

export interface TopicSong {
	title: string
	/** 封面文件名 */
	cover?: string
}

export interface TopicData {
	/** 本届曲目。按{{无色透名祭4}}的嵌入关系判定，模板和条目都还没建时为空 */
	current: TopicSong[]
	/** 本站已收录的本届曲目总数（不受展示上限影响） */
	currentTotal: number
	/** 往期曲目，按加入分类的时间倒序 */
	past: TopicSong[]
}

interface ApiPage {
	title: string
	pageimage?: string
}

interface ApiResponse {
	query?: {
		pages?: ApiPage[]
		categorymembers?: { title: string }[]
		embeddedin?: { title: string }[]
	}
	continue?: Record<string, string>
}

export async function loadTopicData(): Promise<TopicData> {
	const [titles, editions] = await Promise.all([loadCollectedTitles(), loadEditionMembers()])

	/** 届次由各届导航模板的嵌入关系判定 */
	const belongsTo = (edition: number) => (title: string) =>
		editions.get(edition)?.has(title) ?? false
	const currentTitles = titles.filter(belongsTo(CURRENT_EDITION))
	const pastTitles = titles.filter((title) =>
		PAST_EDITIONS.some((edition) => belongsTo(edition)(title)),
	)

	const covers = await loadCoverFiles([...currentTitles, ...pastTitles])
	const toSong = (title: string): TopicSong => ({ title, cover: covers.get(title) })

	return {
		current: currentTitles.slice(0, CURRENT_LIMIT).map(toSong),
		currentTotal: currentTitles.length,
		past: pastTitles.slice(0, PAST_LIMIT).map(toSong),
	}
}

/** 按加入分类的时间倒序取出本站已收录的曲目标题 */
async function loadCollectedTitles(): Promise<string[]> {
	const responses = await callApi({
		list: 'categorymembers',
		cmtitle: PARTICIPATION_CATEGORY,
		cmprop: 'title',
		cmsort: 'timestamp',
		cmdir: 'desc',
		cmlimit: '500',
		cmnamespace: '0',
	})
	return responses.flatMap(({ query }) => query?.categorymembers?.map(({ title }) => title) ?? [])
}

/** 取出各曲目所用封面的文件名 */
async function loadCoverFiles(titles: string[]): Promise<Map<string, string>> {
	const covers = new Map<string, string>()

	const batches = Array.from({ length: Math.ceil(titles.length / TITLE_BATCH_SIZE) }, (_, i) =>
		titles.slice(i * TITLE_BATCH_SIZE, (i + 1) * TITLE_BATCH_SIZE),
	)
	const responses = (
		await Promise.all(
			batches.map((batch) =>
				callApi({
					titles: batch.join('|'),
					prop: 'pageimages',
					piprop: 'name',
					pilimit: 'max',
				}),
			),
		)
	).flat()

	for (const { query } of responses) {
		for (const page of query?.pages ?? []) {
			if (page.pageimage) {
				covers.set(page.title, page.pageimage)
			}
		}
	}
	return covers
}

/** 取出各届导航模板里列出的曲目集合。模板还不存在时该届为空集合 */
async function loadEditionMembers(): Promise<Map<number, Set<string>>> {
	const members = new Map<number, Set<string>>()
	const editions: number[] = [...PAST_EDITIONS, CURRENT_EDITION]
	await Promise.all(
		editions.map(async (edition) => {
			const responses = await callApi({
				list: 'embeddedin',
				eititle: `Template:无色透名祭${edition}`,
				einnamespace: '0',
				eilimit: '500',
			})
			const titles = responses.flatMap(
				({ query }) => query?.embeddedin?.map(({ title }) => title) ?? [],
			)
			members.set(edition, new Set(titles))
		}),
	)
	return members
}

/** 调用wiki的query接口，自动跟随续页 */
async function callApi(params: Record<string, string>): Promise<ApiResponse[]> {
	const responses: ApiResponse[] = []

	const load = async (continuation: Record<string, string>): Promise<void> => {
		if (responses.length >= MAX_API_PAGES) return

		const search = new URLSearchParams({
			action: 'query',
			format: 'json',
			formatversion: '2',
			...params,
			...continuation,
		})
		const response = await fetch(`${API_URL}?${search.toString()}`, {
			headers: { 'user-agent': USER_AGENT },
			signal: AbortSignal.timeout(TIMEOUT_MS),
		})
		if (!response.ok) {
			throw new Error(`请求${API_URL}失败：${response.status} ${response.statusText}`)
		}

		const data = (await response.json()) as ApiResponse
		responses.push(data)
		if (data.continue) await load(data.continue)
	}

	await load({})
	return responses
}
