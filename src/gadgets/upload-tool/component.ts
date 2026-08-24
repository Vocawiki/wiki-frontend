import type { Icon } from '@wikimedia/codex-icons'
import type * as VueTypes from 'vue'

import { useCategoryOptions } from './category-options'
import { useDestFileCheck } from './dest-file-check'
import { msg } from './i18n'
import { useLicensePreview } from './license-preview'
import { TEMPLATE } from './template'
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
			const authorInput = ref('')
			const authorChips = ref<Chip[]>([])
			const authorSelected = ref<string[]>([])
			const authorMissing = ref<Record<string, boolean>>({})
			const functionChips = ref<Chip[]>([])
			const functionInput = ref('')
			const functionSelected = ref<string[]>([])
			const previewText = ref('')
			const previewEdited = ref(false)
			const note = ref('')
			const trademark = ref(false)
			const aiGenerated = ref(false)
			const watchFile = ref(true)
			const ignoreWarnings = ref(false)
			const submitting = ref(false)
			const helpOpen = ref(false)

			/** 非响应式状态（计时器与竞态序号） */
			let chipCheckTimer: ReturnType<typeof setTimeout> | undefined
			let characterFilterTimer: ReturnType<typeof setTimeout> | undefined

			const destState = useDestFileCheck(Vue, api, isReupload)
			const licenseState = useLicensePreview(Vue, api, trademark)
			const categoryState = useCategoryOptions(Vue, api)
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
				return categoryState.objectOptions.value
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
				return categoryState.authorOptions.value
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
					return categoryState.functionLeafOptions.value
				}
				return categoryState.functionLeafOptions.value.filter((o) =>
					o.value.toLowerCase().includes(q),
				)
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
						disambigTitles: categoryState.disambigTitles.value,
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
					void categoryState.ensureObjectOptions()
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
				categoryState.scheduleAuthorSearch(String(v || ''))
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
					void categoryState.fetchDisambigTitles()
					void categoryState.ensureFunctionOptions()
					previewText.value = generatedWikitext.value
					licenseState.fetchLicensePreview()
				}
			})
			onUnmounted(() => {
				// 组件卸载时清理所有在途定时器，避免回调触发已销毁实例
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
				...categoryState,
				sourcePage,
				characterInput,
				characterChips,
				characterSelected,
				authorInput,
				authorChips,
				authorSelected,
				functionChips,
				functionInput,
				functionSelected,
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
		template: TEMPLATE,
	})
}
