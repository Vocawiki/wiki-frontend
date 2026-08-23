import type { Icon } from '@wikimedia/codex-icons'
import type * as VueTypes from 'vue'

import { useDestFileCheck } from './dest-file-check'
import { msg } from './i18n'
import { useLicensePreview } from './license-preview'
import { SITE } from './site-config'
import type { ApiQueryResponse, Chip, UploadResponse } from './types'
import {
	chunk,
	commitChip,
	dedupChips,
	formatBytes,
	lookupEnterHandler,
	notifyError,
	notifySuccess,
	stripAuthorCategory,
	stripCategory,
	trimChip,
} from './utils'
import { buildWikitext } from './wikitext'

const BATCH_UPLOAD_PAGE = 'Special:BatchUpload'

interface UploadComponentContext {
	Vue: typeof VueTypes
	api: mw.Api
	jquery: JQueryStatic
	form: HTMLElement
	presetSource: string
	hasExisting: boolean
	isReupload: boolean
	uploadIcon: string
	restartIcon: string
	backIcon: Icon
	batchIcon: Icon
	helpIcon: Icon
	uploadTextHtml: string
}

export const createUploadComponent = ({
	Vue,
	api,
	jquery: $,
	form,
	presetSource,
	hasExisting,
	isReupload,
	uploadIcon,
	restartIcon,
	backIcon,
	batchIcon,
	helpIcon,
	uploadTextHtml,
}: UploadComponentContext) => {
	const { ref, computed, watch, onMounted, onUnmounted, defineComponent } = Vue

	return defineComponent({
		setup() {
			/** 响应式状态 */
			const sourceType = ref<'File' | 'url'>('File')
			const fileName = ref('')
			const filePreview = ref('')
			const fileMeta = ref('')
			const fileUrl = ref('')
			const sourcePage = ref(presetSource)
			const characterInput = ref('')
			const characterChips = ref<Chip[]>([])
			const characterSelected = ref<string[]>([])
			const characterQuery = ref('')
			const characterMissing = ref<Record<string, boolean>>({})
			const objectOptions = ref<Chip[]>([])
			const objectLoaded = ref(false)
			const objectLoading = ref(false)
			const authorInput = ref('')
			const authorChips = ref<Chip[]>([])
			const authorSelected = ref<string[]>([])
			const authorMissing = ref<Record<string, boolean>>({})
			const authorOptions = ref<Chip[]>([])
			const functionChips = ref<Chip[]>([])
			const functionInput = ref('')
			const functionSelected = ref<string[]>([])
			const functionLeafOptions = ref<Chip[]>([])
			const functionLoaded = ref(false)
			const functionLoading = ref(false)
			const previewText = ref('')
			const previewEdited = ref(false)
			const note = ref('')
			const disambigTitles = ref<string[]>([])
			const trademark = ref(false)
			const aiGenerated = ref(false)
			const watchFile = ref(true)
			const ignoreWarnings = ref(false)
			const submitting = ref(false)
			const helpOpen = ref(false)

			/** 非响应式状态（计时器与竞态序号） */
			let authorSearchTimer: ReturnType<typeof setTimeout> | undefined
			let authorSeq: number | undefined
			let chipCheckTimer: ReturnType<typeof setTimeout> | undefined
			let characterFilterTimer: ReturnType<typeof setTimeout> | undefined

			const destState = useDestFileCheck(Vue, api, isReupload)
			const licenseState = useLicensePreview(Vue, api, trademark)
			const allowedExtensions = mw.config.get('wgFileExtensions') ?? []
			const maxUploadSize = mw.config.get('wgMaxUploadSize')
			const maxUploadBytes = maxUploadSize ? (maxUploadSize.file ?? maxUploadSize['*']) : 0
			const allowedTypesHint = [
				allowedExtensions.length ? msg('notice-types', allowedExtensions.join('、')) : '',
				maxUploadBytes > 0 ? msg('notice-max-size', formatBytes(maxUploadBytes)) : '',
			]
				.filter(Boolean)
				.join('；')

			/** computed */
			const characterMenuItems = computed(() => {
				const q = characterQuery.value
				if (!q) {
					return []
				}
				const added = new Set(characterChips.value.map((c) => c.value))
				return objectOptions.value
					.filter((o) => o.value.toLowerCase().includes(q) && !added.has(o.value))
					.slice(0, 20)
					.map((o) => ({
						value: o.value,
						label: o.value,
						...(o.disambig ? { description: msg('hint-disambig') } : {}),
					}))
			})
			const authorMenuItems = computed(() => {
				const added = new Set(authorChips.value.map((a) => a.value))
				return authorOptions.value
					.filter((o) => !added.has(o.value))
					.slice(0, 20)
					.map((o) => ({
						value: o.value,
						label: o.value,
						...(o.disambig ? { description: msg('hint-disambig') } : {}),
					}))
			})
			const functionMenuItems = computed(() => {
				const q = (functionInput.value || '').trim().toLowerCase()
				if (!q) {
					return functionLeafOptions.value
				}
				return functionLeafOptions.value.filter((o) => o.value.toLowerCase().includes(q))
			})
			const missingCharacterChips = computed(() =>
				characterChips.value.filter((c) => characterMissing.value[c.value]),
			)
			const missingAuthorChips = computed(() =>
				authorChips.value.filter((a) => authorMissing.value[a.value]),
			)
			const missingCharacterText = computed(() =>
				missingCharacterChips.value.map((c) => c.value).join('、'),
			)
			const missingAuthorText = computed(() =>
				missingAuthorChips.value.map((a) => a.value).join('、'),
			)
			const generatedWikitext = computed(() =>
				buildWikitext(
					{
						sourcePage: sourcePage.value,
						authorChips: authorChips.value,
						characterChips: characterChips.value,
						functionChips: functionChips.value,
						licenseTpl: licenseState.license.value,
						licenseParams: licenseState.licenseParams.value,
						trademark: trademark.value,
						aiGenerated: aiGenerated.value,
						disambigTitles: disambigTitles.value,
					},
					msg,
				),
			)

			/** 方法 */
			function syncPreview() {
				if (!previewEdited.value && !isReupload) {
					previewText.value = generatedWikitext.value
				}
			}
			function onPreviewInput() {
				previewEdited.value = true
			}
			function resetPreview() {
				previewEdited.value = false
				previewText.value = generatedWikitext.value
			}
			function chooseFile() {
				const f = document.getElementById('wpUploadFile')
				if (f) {
					f.click()
				}
			}
			// 返回原生表单：隐藏本工具、恢复原生字段集与提交按钮。
			function returnToNativeForm() {
				const mount = document.getElementById('ut-app')
				if (mount) {
					mount.style.display = 'none'
				}
				form.querySelectorAll<HTMLElement>('fieldset').forEach((f) => {
					f.style.display = ''
				})
				const uploadText = document.getElementById('uploadtext')
				if (uploadText) {
					uploadText.style.display = ''
				}
				const nativeSubmit = form.querySelector<HTMLInputElement>('input[name=wpUpload]')
				if (nativeSubmit) {
					nativeSubmit.style.display = ''
				}
			}
			function goToBatchUpload() {
				location.href = mw.util.getUrl(BATCH_UPLOAD_PAGE)
			}
			function scheduleChipCheck() {
				clearTimeout(chipCheckTimer)
				chipCheckTimer = setTimeout(() => {
					void checkChipExistence()
				}, 250)
			}
			async function checkChipExistence() {
				const titles: string[] = []
				characterChips.value.forEach((c) => titles.push('Category:' + c.value))
				authorChips.value.forEach((a) => titles.push('Category:作者:' + a.value))
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
				const nextCharacterChips = characterChips.value.map((c) => {
					const full = 'Category:' + c.value
					if (redirectMap[full]) {
						changed = true
						const value = stripCategory(redirectMap[full])
						if (characterSelected.value.includes(c.value)) {
							characterSelected.value = characterSelected.value.map((s) =>
								s === c.value ? value : s,
							)
						}
						delete characterMissing.value[c.value]
						delete characterMissing.value[value]
						return { ...c, value, ...(typeof c.label === 'string' ? { label: value } : {}) }
					}
					if (missingMap[full] === true) {
						characterMissing.value[c.value] = true
					} else {
						delete characterMissing.value[c.value]
					}
					return c
				})
				const nextAuthorChips = authorChips.value.map((a) => {
					const full = 'Category:作者:' + a.value
					if (redirectMap[full]) {
						changed = true
						const value = stripAuthorCategory(redirectMap[full])
						if (authorSelected.value.includes(a.value)) {
							authorSelected.value = authorSelected.value.map((s) => (s === a.value ? value : s))
						}
						delete authorMissing.value[a.value]
						delete authorMissing.value[value]
						return { ...a, value, ...(typeof a.label === 'string' ? { label: value } : {}) }
					}
					if (missingMap[full] === true) {
						authorMissing.value[a.value] = true
					} else {
						delete authorMissing.value[a.value]
					}
					return a
				})
				if (changed) {
					characterChips.value = dedupChips(nextCharacterChips)
					authorChips.value = dedupChips(nextAuthorChips)
				}
			}
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
						chunk(titles, 50).map(
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
					for (const batch of chunk(parents, 10)) {
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
			function commitFunctionInput() {
				commitChip(functionInput, functionChips, functionSelected)
			}
			function commitCharacterInput() {
				commitChip(characterInput, characterChips, characterSelected)
			}
			function commitAuthorInput() {
				commitChip(authorInput, authorChips, authorSelected)
			}
			const onCharacterLookupKeydown = lookupEnterHandler(commitCharacterInput)
			const onAuthorLookupKeydown = lookupEnterHandler(commitAuthorInput)
			const onFunctionLookupKeydown = lookupEnterHandler(commitFunctionInput)
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
						chunk(titles, 50).map(
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
							if (
								(p.categories ?? []).some((c) => c.title === 'Category:' + SITE.containerCategory)
							) {
								containerSet[name] = true
							}
							subcatsMap[name] = p.categoryinfo?.subcats ?? 0
						})
					})
					// 只为确实含有孙分类的子类再查成员
					const parentsWithChildren = allLeaves.filter((n) => (subcatsMap[n] ?? 0) > 0)
					// 分批拉取子分类成员，避免瞬间并发大量请求
					const entries: { n: string; s: string[] }[] = []
					for (const batch of chunk(parentsWithChildren, 10)) {
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
			function flagDisambig() {
				const titles = disambigTitles.value
				objectOptions.value.forEach((o) => {
					o.disambig = titles.includes('Category:' + o.value)
				})
				authorOptions.value.forEach((a) => {
					a.disambig = titles.includes('Category:作者:' + a.value)
				})
			}
			function submit() {
				if (submitting.value) {
					return
				}
				// 客户端校验：未选择文件/未填写网址时直接提示，不提交
				if (sourceType.value === 'File' && !fileName.value) {
					notifyError(msg('err-no-file'))
					return
				}
				if (sourceType.value === 'url' && !(fileUrl.value || '').trim()) {
					notifyError(msg('err-no-url'))
					return
				}
				// 许可协议必填字段校验
				const o = licenseState.currentLicense.value
				if (o) {
					const missing = o.fields.filter(
						(f) =>
							f.required &&
							!String(licenseState.licenseFieldValues.value[o.tpl + '|' + f.key] ?? '').trim(),
					)
					if (missing.length) {
						notifyError(msg('err-required', missing.map((f) => f.label).join('、')))
						return
					}
				}
				void apiUpload()
			}
			// 清空文件输入以防止触发离开确认，从而静默跳转到文件页。
			function releaseNativeLeaveConfirmation(): void {
				const fileInput = document.getElementById('wpUploadFile') as HTMLInputElement | null
				if (fileInput) {
					fileInput.value = ''
				}
				$(form).data('origtext', $(form).serialize())
			}
			function finishUpload(filename: string) {
				notifySuccess(msg('success-uploaded'))
				setTimeout(() => {
					releaseNativeLeaveConfirmation()
					location.href = mw.util.getUrl('File:' + filename)
				}, 500)
			}
			async function apiUpload() {
				const filename = (destState.destFile.value || fileName.value || '').trim()
				if (!filename) {
					notifyError(msg('err-no-dest'))
					return
				}
				const params: Record<string, string | boolean> = {
					filename,
					comment: (note.value || '').trim(),
					watchlist: watchFile.value ? 'watch' : 'unwatch',
					ignorewarnings: isReupload ? true : ignoreWarnings.value,
				}
				if (!isReupload) {
					params.text = previewText.value
				}
				const fail = (code: string | null, result: UploadResponse): void => {
					const w = result?.upload?.warnings
					if (w?.exists) {
						notifyError(msg('err-exists'))
					} else if (w?.badfilename) {
						notifyError(msg('err-badfilename', w.badfilename))
					} else if (result?.errors?.[0]?.['*']) {
						// errorformat=plaintext 时，本地化错误文本在 errors[0]["*"]
						notifyError(result.errors[0]['*'])
					} else if (result?.error?.info) {
						notifyError(result.error.info)
					} else if (w) {
						const k = Object.keys(w)[0] ?? ''
						notifyError(w[k] || msg('err-blocked', k))
					} else {
						notifyError(code ?? msg('err-upload-failed'))
					}
				}
				// jQuery Deferred的fail回调签名是 (code, result)，而await只能拿到
				// reject的第一个参数；包装成对象以保留result供fail()解析警告详情
				const awaitRequest = (request: JQuery.Promise<UploadResponse>): Promise<UploadResponse> =>
					new Promise((resolve, reject) => {
						request
							.done((data) => resolve(data))
							.fail((code: string, result: UploadResponse) => {
								reject(Object.assign(new Error(code || 'upload failed'), { code, result }))
							})
					})
				submitting.value = true
				try {
					let request: JQuery.Promise<UploadResponse>
					if (sourceType.value === 'url') {
						params.url = (fileUrl.value || '').trim()
						// URL上传遇警告不会reject，结果走result.upload.warnings，需手动处理
						request = api.postWithToken('csrf', {
							action: 'upload',
							...params,
						}) as unknown as JQuery.Promise<UploadResponse>
					} else {
						const file = (document.getElementById('wpUploadFile') as HTMLInputElement | null)
							?.files?.[0]
						if (!file) {
							notifyError(msg('err-no-file'))
							return
						}
						request = api.upload(file, params)
					}
					const result = await awaitRequest(request)
					if (result?.upload?.result === 'Warning') {
						fail(null, result)
						return
					}
					finishUpload(filename)
				} catch (e) {
					// 文件上传遇警告会reject({code, result})，走fail()解析
					const err = e as { code?: string; result?: UploadResponse }
					fail(err.code ?? null, err.result ?? {})
				} finally {
					submitting.value = false
				}
			}

			/** watch */
			watch(sourceType, () => {
				if (sourceType.value === 'url') {
					filePreview.value = (fileUrl.value || '').trim()
					fileName.value = ''
					fileMeta.value = ''
				} else {
					filePreview.value = ''
					fileName.value = ''
					fileMeta.value = ''
				}
			})
			watch(fileUrl, (v) => {
				if (sourceType.value === 'url') {
					filePreview.value = (v || '').trim()
				}
			})
			watch(characterInput, (v) => {
				if (v && String(v).trim()) {
					void ensureObjectOptions()
				}
				// 稍作防抖：让组件的pending标志先置位，菜单才能在输入时打开；
				// 同时避免每敲一个字都同步重算建议。
				clearTimeout(characterFilterTimer)
				characterFilterTimer = setTimeout(() => {
					characterQuery.value = String(v || '')
						.trim()
						.toLowerCase()
				}, 100)
			})
			watch(authorInput, (v) => {
				clearTimeout(authorSearchTimer)
				const q = String(v || '').trim()
				if (!q) {
					// 让仍在途的搜索请求失效，避免清空后旧结果回填
					authorSeq = (authorSeq ?? 0) + 1
					authorOptions.value = []
					return
				}
				authorSearchTimer = setTimeout(() => {
					void searchAuthors(q)
				}, 300)
			})
			watch(generatedWikitext, () => {
				syncPreview()
			})
			watch(
				characterChips,
				() => {
					scheduleChipCheck()
				},
				{ deep: true },
			)
			watch(
				authorChips,
				() => {
					scheduleChipCheck()
				},
				{ deep: true },
			)
			watch(
				functionChips,
				(chips) => {
					chips.forEach(trimChip)
				},
				{ deep: true },
			)
			/** lifecycle */
			onMounted(() => {
				const dest = document.getElementById('wpDestFile') as HTMLInputElement | null
				if (dest) {
					destState.destFile.value = dest.value || ''
				}
				const fileEl = document.getElementById('wpUploadFile') as HTMLInputElement | null
				if (fileEl) {
					fileEl.addEventListener('change', () => {
						const f = fileEl.files?.[0]
						fileName.value = f ? f.name : ''
						filePreview.value = ''
						fileMeta.value = ''
						if (f) {
							fileMeta.value = formatBytes(f.size)
							if (f.type?.startsWith('image/')) {
								const reader = new FileReader()
								reader.onload = (ev) => {
									filePreview.value = (ev.target?.result as string) || ''
								}
								reader.readAsDataURL(f)
								const img = new Image()
								img.onload = () => {
									fileMeta.value = `${img.width} × ${img.height}, ${formatBytes(f.size)}`
								}
								img.src = URL.createObjectURL(f)
							}
						}
						setTimeout(() => {
							const d = document.getElementById('wpDestFile') as HTMLInputElement | null
							if (d) {
								destState.destFile.value = d.value
							}
						}, 0)
					})
				}
				// 防止在文本框里回车意外提交表单
				form.addEventListener('keydown', (e) => {
					const target = e.target as HTMLInputElement | null
					if (e.key === 'Enter' && target?.tagName === 'INPUT' && target.type !== 'submit') {
						e.preventDefault()
					}
				})
				licenseState.updateLicenseHint()
				if (!isReupload) {
					void fetchDisambigTitles()
					void ensureFunctionOptions()
					previewText.value = generatedWikitext.value
					licenseState.fetchLicensePreview()
				}
			})
			onUnmounted(() => {
				// 组件卸载时清理所有在途定时器，避免回调触发已销毁实例
				clearTimeout(authorSearchTimer)
				clearTimeout(chipCheckTimer)
				clearTimeout(characterFilterTimer)
			})

			return {
				sourceType,
				fileName,
				filePreview,
				fileMeta,
				fileUrl,
				...destState,
				sourcePage,
				characterInput,
				characterChips,
				characterSelected,
				objectLoading,
				authorInput,
				authorChips,
				authorSelected,
				functionChips,
				functionInput,
				functionSelected,
				functionLoading,
				previewText,
				previewEdited,
				note,
				...licenseState,
				trademark,
				aiGenerated,
				watchFile,
				ignoreWarnings,
				submitting,
				helpOpen,
				allowedTypesHint,
				existingDesc: hasExisting,
				isReupload,
				characterMenuItems,
				authorMenuItems,
				functionMenuItems,
				missingCharacterChips,
				missingAuthorChips,
				missingCharacterText,
				missingAuthorText,
				chooseFile,
				returnToNativeForm,
				goToBatchUpload,
				ensureFunctionOptions,
				commitFunctionInput,
				commitCharacterInput,
				commitAuthorInput,
				onCharacterLookupKeydown,
				onAuthorLookupKeydown,
				onFunctionLookupKeydown,
				onPreviewInput,
				resetPreview,
				submit,
				uploadIcon,
				restartIcon,
				backIcon,
				batchIcon,
				helpIcon,
				uploadTextHtml,
				msg,
			}
		},
		template: `
<div class="ut-root">
	<div class="ut-toolbar ut-gap">
		<cdx-button type="button" @click="returnToNativeForm">
			<cdx-icon :icon="backIcon"></cdx-icon>
			{{ msg('btn-back-to-native') }}
		</cdx-button>
		<cdx-button type="button" @click="goToBatchUpload">
			<cdx-icon :icon="batchIcon"></cdx-icon>
			{{ msg('btn-batch-upload') }}
		</cdx-button>
		<cdx-button v-if="uploadTextHtml" type="button" weight="quiet" :aria-label="msg('uploadtext-title')" @click="helpOpen = true">
			<cdx-icon :icon="helpIcon"></cdx-icon>
		</cdx-button>
	</div>

	<cdx-message v-if="existingDesc && !isReupload" type="warning" inline class="ut-gap">
		{{ msg('notice-existing-desc') }}
	</cdx-message>

	<div class="ut-layout">
		<div class="ut-main">
		<div class="ut-section">
			<h2 class="ut-title">{{ msg('source-section') }}</h2>
			<div class="ut-radio-row">
				<cdx-radio v-model="sourceType" input-value="File" name="ut-source">{{ msg('source-local') }}</cdx-radio>
				<cdx-radio v-model="sourceType" input-value="url" name="ut-source">{{ msg('source-url') }}</cdx-radio>
			</div>
			<div v-if="sourceType === 'File'" class="ut-drop">
				<div
					class="ut-drop__area"
					role="button"
					tabindex="0"
					@click="chooseFile"
					@keydown.enter="chooseFile"
					@keydown.space.prevent="chooseFile"
				>
					<template v-if="filePreview">
						<img class="ut-drop__preview" :src="filePreview" :alt="fileName" />
						<span class="ut-drop__hint" v-text="fileName + (fileMeta ? ' · ' + fileMeta : '')"></span>
						<cdx-button type="button">
							<cdx-icon :icon="restartIcon"></cdx-icon>
							{{ msg('btn-rechoose-file') }}
						</cdx-button>
					</template>
					<template v-else>
						<cdx-icon class="ut-drop__icon" :icon="uploadIcon"></cdx-icon>
						<cdx-button type="button">{{ msg('btn-choose-file') }}</cdx-button>
						<span class="ut-drop__hint" v-text="msg('preview-file-empty')"></span>
					</template>
				</div>
			</div>
			<template v-else>
				<div class="ut-row2">
					<cdx-text-input name="ut-file-url" v-model="fileUrl" :placeholder="msg('placeholder-file-url')" class="ut-full"></cdx-text-input>
				</div>
				<div v-if="filePreview" class="ut-file-preview ut-gap">
					<img :src="filePreview" alt="" />
				</div>
			</template>
			<cdx-message v-if="allowedTypesHint" type="notice" inline class="ut-gap">
				{{ allowedTypesHint }}
			</cdx-message>
		</div>

		<div class="ut-section">
			<h2 class="ut-title">{{ msg('dest-section') }}</h2>
			<cdx-text-input name="ut-dest-file" v-model="destFile" :disabled="isReupload" :placeholder="msg('placeholder-dest')" class="ut-full"></cdx-text-input>
			<div v-if="destFileExists && !isReupload" class="ut-destfile-warning">
				<cdx-message type="warning" inline>
					<span v-text="msg('dest-exists-prefix')"></span>
					<a :href="destFileUrl" target="_blank" v-text="'File:' + destFile"></a>
				</cdx-message>
				<img v-if="destFileThumb" :src="destFileThumb" :alt="destFile" class="ut-destfile-thumb" />
			</div>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('desc-section') }}</h2>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('source-page-label') }}</div>
				<cdx-text-input name="ut-source-page" v-model="sourcePage" :placeholder="msg('placeholder-source-page')" class="ut-full"></cdx-text-input>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('character-label') }}</div>
				<div @keydown.capture="onCharacterLookupKeydown">
					<cdx-multiselect-lookup name="ut-character"
						v-model:input-chips="characterChips"
						v-model:selected="characterSelected"
						v-model:input-value="characterInput"
						:menu-items="characterMenuItems"
						:placeholder="msg('placeholder-character')"
						@focus="ensureObjectOptions"
						@blur="commitCharacterInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
				<cdx-message v-if="missingCharacterChips.length" type="warning" inline class="ut-gap">
					<span v-text="msg('missing-character-prefix') + missingCharacterText"></span>
				</cdx-message>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('author-label') }}</div>
				<div @keydown.capture="onAuthorLookupKeydown">
					<cdx-multiselect-lookup name="ut-author"
						v-model:input-chips="authorChips"
						v-model:selected="authorSelected"
						v-model:input-value="authorInput"
						:menu-items="authorMenuItems"
						:placeholder="msg('placeholder-author')"
						@blur="commitAuthorInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
				<cdx-message v-if="missingAuthorChips.length" type="warning" inline class="ut-gap">
					<span v-text="msg('missing-author-prefix') + missingAuthorText"></span>
				</cdx-message>
			</div>

			<div class="ut-field-row">
				<div class="ut-sublabel">{{ msg('function-label') }}</div>
				<div @keydown.capture="onFunctionLookupKeydown">
					<cdx-multiselect-lookup name="ut-function"
						v-model:input-chips="functionChips"
						v-model:selected="functionSelected"
						v-model:input-value="functionInput"
						:menu-items="functionMenuItems"
						:placeholder="msg('placeholder-function')"
						@focus="ensureFunctionOptions"
						@blur="commitFunctionInput"
					>
						<template #no-results>{{ msg('no-results-hint') }}</template>
					</cdx-multiselect-lookup>
				</div>
			</div>
			<cdx-checkbox name="ut-ai-generated" v-model="aiGenerated" class="ut-gap">{{ msg('ai-generated-label') }}</cdx-checkbox>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('license-section') }}</h2>
			<cdx-select name="ut-license" v-model:selected="license" :menu-items="licenseOptions" :default-label="msg('license-default-label')" class="ut-full"></cdx-select>
			<cdx-message v-if="licenseHint" type="error" inline class="ut-gap">
				<span v-text="licenseHint"></span>
			</cdx-message>
			<div v-for="f in currentLicenseFields" :key="f.key" class="ut-field-row">
				<div class="ut-sublabel" v-text="f.label"></div>
				<cdx-text-input name="ut-license-field" v-if="f.type === 'text'" v-model="licenseFieldValues[f.key]" :placeholder="f.placeholder" class="ut-full"></cdx-text-input>
				<cdx-select name="ut-license-field" v-else v-model:selected="licenseFieldValues[f.key]" :menu-items="f.menuItems" class="ut-full"></cdx-select>
			</div>
			<cdx-checkbox name="ut-trademark" v-model="trademark" class="ut-gap">{{ msg('trademark-label') }}</cdx-checkbox>
			<div v-if="licensePreviewHtml" class="ut-license-preview" v-html="licensePreviewHtml"></div>
			<div v-else-if="licensePreviewLoading" class="ut-license-preview ut-license-loading">{{ msg('license-loading') }}</div>
		</div>

		<div class="ut-section" v-if="!isReupload">
			<h2 class="ut-title">{{ msg('desc-preview-section') }}</h2>
			<textarea id="ut-description-preview" name="ut-description-preview" v-model="previewText" class="ut-preview ut-preview-edit" @input="onPreviewInput"></textarea>
			<div v-if="previewEdited" class="ut-row2">
				<cdx-message type="notice" inline>{{ msg('preview-edited') }}</cdx-message>
				<cdx-button type="button" @click="resetPreview">{{ msg('btn-reset-preview') }}</cdx-button>
			</div>
		</div>

		</div>

		<aside class="ut-side">
			<div class="ut-side-inner">
				<div class="ut-section">
					<h2 class="ut-title">{{ msg('note-section') }}</h2>
					<cdx-text-input name="ut-note" v-model="note" :placeholder="msg('placeholder-note')" class="ut-full"></cdx-text-input>
				</div>
				<div class="ut-section">
					<h2 class="ut-title">{{ msg('options-section') }}</h2>
					<cdx-checkbox name="ut-watch" v-model="watchFile">{{ msg('watch-label') }}</cdx-checkbox>
					<cdx-checkbox name="ut-ignore-warnings" v-model="ignoreWarnings">{{ msg('ignore-warnings-label') }}</cdx-checkbox>
				</div>
				<div class="ut-actions">
					<cdx-button type="button" action="progressive" weight="primary" :disabled="submitting" @click="submit">{{ submitting ? msg('btn-submitting') : msg('btn-submit') }}</cdx-button>
				</div>
			</div>
		</aside>
	</div>

	<cdx-dialog v-model:open="helpOpen" :title="msg('uploadtext-title')" use-close-button>
		<div class="ut-help-content" v-html="uploadTextHtml"></div>
	</cdx-dialog>
</div>
`,
	})
}
