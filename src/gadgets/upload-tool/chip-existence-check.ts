import type * as VueTypes from 'vue'

import type { ApiQueryResponse, Chip } from './types'
import { chunk, dedupChips, stripAuthorCategory, stripCategory } from './utils'

interface ChipExistenceDeps {
	characterChips: VueTypes.Ref<Chip[]>
	authorChips: VueTypes.Ref<Chip[]>
	characterSelected: VueTypes.Ref<string[]>
	authorSelected: VueTypes.Ref<string[]>
	characterMissing: VueTypes.Ref<Record<string, boolean>>
	authorMissing: VueTypes.Ref<Record<string, boolean>>
}

/** 角色/作者分类的存在性检查与重定向纠正。 */
export function useChipExistenceCheck(
	Vue: typeof VueTypes,
	api: mw.Api,
	deps: ChipExistenceDeps,
): void {
	const { watch, onUnmounted } = Vue

	let chipCheckTimer: ReturnType<typeof setTimeout> | undefined

	function scheduleChipCheck() {
		clearTimeout(chipCheckTimer)
		chipCheckTimer = setTimeout(() => {
			void checkChipExistence()
		}, 250)
	}

	async function checkChipExistence() {
		const titles: string[] = []
		deps.characterChips.value.forEach((c) => titles.push('Category:' + c.value))
		deps.authorChips.value.forEach((a) => titles.push('Category:作者:' + a.value))
		if (!titles.length) {
			return
		}
		const results = await Promise.all(
			chunk(titles, 50).map(async (chunkTitles): Promise<ApiQueryResponse | null> => {
				try {
					return await api.get({
						action: 'query',
						redirects: 1,
						titles: chunkTitles.join('|'),
						formatversion: 2,
					})
				} catch {
					return null // 忽略单个分块失败
				}
			}),
		)
		const redirectMap: Record<string, string> = {}
		const missingMap: Record<string, boolean> = {}
		results.forEach((data) => {
			if (!data) {
				return
			}
			;(data.query?.redirects ?? []).forEach((r) => {
				redirectMap[r.from] = r.to
			})
			;(data.query?.pages ?? []).forEach((p) => {
				missingMap[p.title] = !!p.missing
			})
		})
		let changed = false
		const nextCharacterChips = deps.characterChips.value.map((c) => {
			const full = 'Category:' + c.value
			if (redirectMap[full]) {
				changed = true
				const value = stripCategory(redirectMap[full])
				if (deps.characterSelected.value.includes(c.value)) {
					deps.characterSelected.value = deps.characterSelected.value.map((s) =>
						s === c.value ? value : s,
					)
				}
				delete deps.characterMissing.value[c.value]
				delete deps.characterMissing.value[value]
				return { ...c, value, ...(typeof c.label === 'string' ? { label: value } : {}) }
			}
			if (missingMap[full] === true) {
				deps.characterMissing.value[c.value] = true
			} else {
				delete deps.characterMissing.value[c.value]
			}
			return c
		})
		const nextAuthorChips = deps.authorChips.value.map((a) => {
			const full = 'Category:作者:' + a.value
			if (redirectMap[full]) {
				changed = true
				const value = stripAuthorCategory(redirectMap[full])
				if (deps.authorSelected.value.includes(a.value)) {
					deps.authorSelected.value = deps.authorSelected.value.map((s) =>
						s === a.value ? value : s,
					)
				}
				delete deps.authorMissing.value[a.value]
				delete deps.authorMissing.value[value]
				return { ...a, value, ...(typeof a.label === 'string' ? { label: value } : {}) }
			}
			if (missingMap[full] === true) {
				deps.authorMissing.value[a.value] = true
			} else {
				delete deps.authorMissing.value[a.value]
			}
			return a
		})
		if (changed) {
			deps.characterChips.value = dedupChips(nextCharacterChips)
			deps.authorChips.value = dedupChips(nextAuthorChips)
		}
	}

	watch(
		deps.characterChips,
		() => {
			scheduleChipCheck()
		},
		{ deep: true },
	)
	watch(
		deps.authorChips,
		() => {
			scheduleChipCheck()
		},
		{ deep: true },
	)
	onUnmounted(() => {
		clearTimeout(chipCheckTimer)
	})
}
