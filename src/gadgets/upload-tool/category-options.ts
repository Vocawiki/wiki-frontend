import { cluster } from 'radashi'
import type * as VueTypes from 'vue'

import { SITE } from './site-config'
import type { ApiQueryResponse, Chip } from './types'
import { stripAuthorCategory, stripCategory } from './utils'

/** 分类树选项的加载与作者搜索。 */
export function useCategoryOptions(Vue: typeof VueTypes, api: mw.Api) {
	const { ref, onUnmounted } = Vue

	const objectOptions = ref<Chip[]>([])
	const objectLoaded = ref(false)
	const objectLoading = ref(false)
	const functionLeafOptions = ref<Chip[]>([])
	const functionLoaded = ref(false)
	const functionLoading = ref(false)
	const disambigTitles = ref<string[]>([])
	const authorOptions = ref<Chip[]>([])

	let authorSearchTimer: ReturnType<typeof setTimeout> | undefined
	let authorSeq: number | undefined

	function fetchSubcats(title: string) {
		const page = async (acc: string[], token: string | null): Promise<string[]> => {
			const params: Record<string, string | number> = {
				action: 'query',
				list: 'categorymembers',
				cmtitle: 'Category:' + title,
				cmlimit: 500,
				cmnamespace: 14,
			}
			if (token) {
				params.cmcontinue = token
			}
			const data = (await api.get(params)) as ApiQueryResponse
			;(data.query?.categorymembers ?? []).forEach((x) => acc.push(stripCategory(x.title)))
			if (data.continue?.cmcontinue) {
				return page(acc, data.continue.cmcontinue)
			}
			return acc
		}
		return page([], null)
	}

	function flagDisambig() {
		const titles = disambigTitles.value
		objectOptions.value.forEach((o) => {
			o.disambig = titles.includes('Category:' + o.value)
		})
		authorOptions.value.forEach((a) => {
			a.disambig = titles.includes('Category:作者:' + a.value)
		})
	}

	function scheduleAuthorSearch(rawQuery: string) {
		clearTimeout(authorSearchTimer)
		const q = String(rawQuery || '').trim()
		if (!q) {
			// 让仍在途的搜索请求失效，避免清空后旧结果回填
			authorSeq = (authorSeq ?? 0) + 1
			authorOptions.value = []
			return
		}
		authorSearchTimer = setTimeout(() => {
			void searchAuthors(q)
		}, 300)
	}

	async function searchAuthors(query: string) {
		query = String(query || '').trim()
		if (!query) {
			authorOptions.value = []
			return
		}
		const seq = (authorSeq = (authorSeq ?? 0) + 1)
		try {
			const data = (await api.get({
				action: 'query',
				list: 'prefixsearch',
				pssearch: '作者:' + query,
				psnamespace: 14,
				pslimit: 20,
			})) as ApiQueryResponse
			if (seq !== authorSeq) {
				return // 已有更新的搜索，丢弃过期结果
			}
			authorOptions.value = (data.query?.prefixsearch ?? []).map((p) => {
				const name = stripAuthorCategory(p.title)
				return { value: name, label: name }
			})
			flagDisambig()
		} catch {
			if (seq === authorSeq) {
				authorOptions.value = []
			}
		}
	}

	async function ensureObjectOptions() {
		if (objectLoaded.value || objectLoading.value) {
			return
		}
		objectLoading.value = true
		try {
			const groups = await Promise.all(SITE.objectRoots.map((title) => fetchSubcats(title)))
			const names = new Set(groups.flat())
			const titles = [...names].map((n) => 'Category:' + n)
			const results = await Promise.all(
				cluster(titles, 50).map(
					async (c) =>
						(await api.get({
							action: 'query',
							prop: 'categoryinfo',
							titles: c.join('|'),
							formatversion: 2,
						})) as ApiQueryResponse,
				),
			)
			const parents: string[] = []
			results.forEach((data) => {
				;(data.query?.pages ?? []).forEach((p) => {
					if ((p.categoryinfo?.subcats ?? 0) > 0) {
						parents.push(stripCategory(p.title))
					}
				})
			})
			// 分批拉取孙分类，避免父分类过多时瞬间并发大量请求
			for (const batch of cluster(parents, 10)) {
				const grandchildren = await Promise.all(batch.map((n) => fetchSubcats(n)))
				grandchildren.forEach((g) => g.forEach((n) => names.add(n)))
			}
			objectOptions.value = [...names].map((n) => ({ value: n, label: n }))
			objectLoaded.value = true
			flagDisambig()
		} catch {
			// 忽略，保留空列表
		} finally {
			objectLoading.value = false
		}
	}

	async function ensureFunctionOptions() {
		if (functionLoaded.value || functionLoading.value) {
			return
		}
		functionLoading.value = true
		try {
			const roots = SITE.functionRoots
			const [tech = [], intro = []] = await Promise.all(roots.map((r) => fetchSubcats(r)))
			const allLeaves = tech.concat(intro)
			const allNames = [...roots, ...allLeaves]
			const titles = allNames.map((n) => 'Category:' + n)
			const results = await Promise.all(
				cluster(titles, 50).map(
					async (c) =>
						(await api.get({
							action: 'query',
							prop: 'categories|categoryinfo',
							cllimit: 'max',
							titles: c.join('|'),
							formatversion: 2,
						})) as ApiQueryResponse,
				),
			)
			const containerSet: Record<string, boolean> = {}
			const subcatsMap: Record<string, number> = {}
			results.forEach((data) => {
				;(data.query?.pages ?? []).forEach((p) => {
					const name = stripCategory(p.title)
					if ((p.categories ?? []).some((c) => c.title === 'Category:' + SITE.containerCategory)) {
						containerSet[name] = true
					}
					subcatsMap[name] = p.categoryinfo?.subcats ?? 0
				})
			})
			// 只为确实含有孙分类的子类再查成员
			const parentsWithChildren = allLeaves.filter((n) => (subcatsMap[n] ?? 0) > 0)
			// 分批拉取子分类成员，避免瞬间并发大量请求
			const entries: { n: string; s: string[] }[] = []
			for (const batch of cluster(parentsWithChildren, 10)) {
				entries.push(
					...(await Promise.all(batch.map(async (n) => ({ n, s: await fetchSubcats(n) })))),
				)
			}
			const childrenMap: Record<string, string[]> = {}
			childrenMap[roots[0]] = tech
			childrenMap[roots[1]] = intro
			entries.forEach((e) => {
				childrenMap[e.n] = e.s
			})
			const functionLeaf: Chip[] = []
			roots.forEach((root) => {
				if (!containerSet[root]) {
					functionLeaf.push({ value: root, label: root })
				}
				;(childrenMap[root] ?? []).forEach((child) => {
					if (!containerSet[child]) {
						functionLeaf.push({ value: child, label: '　' + child })
					}
					;(childrenMap[child] ?? []).forEach((gc) => {
						functionLeaf.push({ value: gc, label: '　　' + gc })
					})
				})
			})
			// 同名分类可能出现在多个层级/子树，按value去重（保留最先出现的层级）
			const seen = new Set<string>()
			functionLeafOptions.value = functionLeaf.filter((o) => {
				if (seen.has(o.value)) {
					return false
				}
				seen.add(o.value)
				return true
			})
			functionLoaded.value = true
		} catch {
			functionLeafOptions.value = []
		} finally {
			functionLoading.value = false
		}
	}

	async function fetchDisambigTitles() {
		// 只拉消歧义分类成员名单，本地判断基础名是否在名单里
		try {
			const titles: string[] = []
			let cmcontinue: string | undefined
			do {
				const params: Record<string, string | number> = {
					action: 'query',
					list: 'categorymembers',
					cmtitle: 'Category:' + SITE.disambigCategory,
					cmlimit: 500,
					cmnamespace: 14,
				}
				if (cmcontinue) {
					params.cmcontinue = cmcontinue
				}
				const data = (await api.get(params)) as ApiQueryResponse
				;(data.query?.categorymembers ?? []).forEach((m) => titles.push(m.title))
				cmcontinue = data.continue?.cmcontinue
			} while (cmcontinue)
			disambigTitles.value = titles
			flagDisambig()
		} catch {
			disambigTitles.value = []
		}
	}

	onUnmounted(() => {
		clearTimeout(authorSearchTimer)
	})

	return {
		objectOptions,
		objectLoading,
		functionLeafOptions,
		functionLoading,
		disambigTitles,
		authorOptions,
		ensureObjectOptions,
		ensureFunctionOptions,
		fetchDisambigTitles,
		scheduleAuthorSearch,
	}
}
