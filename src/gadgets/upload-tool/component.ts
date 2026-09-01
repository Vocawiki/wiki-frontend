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
			const helpOpen = ref(false)

			/** 非响应式状态（计时器） */
			let characterFilterTimer: ReturnType<typeof setTimeout> | undefined

			const destState = useDestFileCheck(Vue, api, isReupload)
			const licenseState = useLicensePreview(Vue, api, trademark)
			const categoryState = useCategoryOptions(Vue, api)
			const { chooseFile } = useFileInput(Vue, {
				fileName,
				filePreview,
				fileMeta,
				destFile: destState.destFile,
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
				{ deep: true },
			)
			/** lifecycle */
			onMounted(() => {
				const dest = document.getElementById('wpDestFile') as HTMLInputElement | null
				if (dest) {
					destState.destFile.value = dest.value || ''
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
				// 组件卸载时清理在途定时器，避免回调触发已销毁实例
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
