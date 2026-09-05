import type { Icon } from '@wikimedia/codex-icons'
import type * as VueTypes from 'vue'

import { useCategoryOptions } from './category-options'
import { useChipExistenceCheck } from './chip-existence-check'
import { useDestFileCheck } from './dest-file-check'
import { useFileInput } from './file-input'
import { msg } from './i18n'
import { useLicensePreview } from './license-preview'
import { TEMPLATE } from './template'
import type { Chip } from './types'
import { useUploadSubmit } from './upload-submit'
import { commitChip, formatBytes, lookupEnterHandler, trimChip } from './utils'
import { buildWikitext } from './wikitext'

const BATCH_UPLOAD_PAGE = 'Special:BatchUpload'

interface UploadComponentContext {
	Vue: typeof VueTypes
	api: mw.Api
	form: HTMLElement
	presetSource: string
	initialDesc: string
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
	initialDesc,
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
			const helpOpen = ref(false)
			const dragging = ref(false)
			const fileError = ref('')

			/** 非响应式状态（计时器与拖拽计数） */
			let characterFilterTimer: ReturnType<typeof setTimeout> | undefined
			let dragCounter = 0

			const destState = useDestFileCheck(Vue, api, isReupload)
			const licenseState = useLicensePreview(Vue, api, trademark)
			const categoryState = useCategoryOptions(Vue, api)
			const allowedExtensions = mw.config.get('wgFileExtensions') ?? []
			const maxUploadSize = mw.config.get('wgMaxUploadSize')
			const maxUploadBytes = maxUploadSize ? (maxUploadSize.file ?? maxUploadSize['*']) : 0
			const { chooseFile } = useFileInput(Vue, {
				fileName,
				filePreview,
				fileMeta,
				fileError,
				destFile: destState.destFile,
				isReupload,
				maxUploadBytes,
			})
			useChipExistenceCheck(Vue, api, {
				characterChips,
				authorChips,
				characterSelected,
				authorSelected,
				characterMissing,
				authorMissing,
			})
			const { submitting, submit } = useUploadSubmit(Vue, {
				api,
				form,
				isReupload,
				sourceType,
				fileName,
				fileUrl,
				destFile: destState.destFile,
				previewText,
				note,
				watchFile,
				ignoreWarnings,
				currentLicense: licenseState.currentLicense,
				licenseFieldValues: licenseState.licenseFieldValues,
			})
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

			/** 拖拽上传：把拖入的文件写入隐藏的#wpUploadFile再派发change，复用既有逻辑 */
			function onDragEnter() {
				dragCounter++
				dragging.value = true
			}
			function onDragLeave() {
				dragCounter = Math.max(0, dragCounter - 1)
				if (dragCounter === 0) {
					dragging.value = false
				}
			}
			function onDrop(e: DragEvent) {
				dragCounter = 0
				dragging.value = false
				const f = e.dataTransfer?.files?.[0]
				if (!f) return
				const fileEl = document.getElementById('wpUploadFile') as HTMLInputElement | null
				if (!fileEl) return
				// 直接给 input.files 赋值在多数现代浏览器可用，旧浏览器静默放弃
				try {
					const dt = new DataTransfer()
					dt.items.add(f)
					fileEl.files = dt.files
				} catch {
					return
				}
				fileEl.dispatchEvent(new Event('change', { bubbles: true }))
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
					// 仅当用户尚未手填目标名时，从URL末段推导一个默认名
					if (!destState.destFile.value.trim()) {
						try {
							const base = new URL(v).pathname.split('/').pop() || ''
							if (base) destState.destFile.value = decodeURIComponent(base)
						} catch {
							/* URL还没拼完整，忽略 */
						}
					}
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
				}, 300)
			})
			watch(authorInput, (v) => {
				categoryState.scheduleAuthorSearch(String(v || ''))
			})
			watch(generatedWikitext, () => {
				syncPreview()
			})
			watch(
				functionChips,
				(chips) => {
					chips.forEach(trimChip)
				},
				{ deep: true, flush: 'sync' },
			)
			/** lifecycle */
			// 防止在文本框里回车意外提交原生表单
			function onFormKeydown(e: KeyboardEvent) {
				const target = e.target as HTMLInputElement | null
				if (e.key === 'Enter' && target?.tagName === 'INPUT' && target.type !== 'submit') {
					e.preventDefault()
				}
			}
			onMounted(() => {
				const dest = document.getElementById('wpDestFile') as HTMLInputElement | null
				if (dest) {
					destState.destFile.value = dest.value || ''
				}
				form.addEventListener('keydown', onFormKeydown)
				licenseState.updateLicenseHint()
				if (!isReupload) {
					void categoryState.fetchDisambigTitles()
					void categoryState.ensureFunctionOptions()
					// 已有描述时回填原文进入手编模式，让用户清楚要被覆盖的内容；
					// 否则用自动生成的wikitext。「重置为自动生成」可随时切回。
					if (hasExisting) {
						previewText.value = initialDesc
						previewEdited.value = true
					} else {
						previewText.value = generatedWikitext.value
					}
					licenseState.fetchLicensePreview()
				}
			})
			onUnmounted(() => {
				// 组件卸载时清理在途定时器与事件监听，避免回调触发已销毁实例
				clearTimeout(characterFilterTimer)
				form.removeEventListener('keydown', onFormKeydown)
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
				dragging,
				fileError,
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
				onDragEnter,
				onDragLeave,
				onDrop,
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
