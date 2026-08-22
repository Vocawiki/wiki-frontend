import type * as VueTypes from 'vue'

import { msg } from './i18n'
import { buildLicenseMenu, LICENSES } from './license-config'
import type { ApiParseResponse } from './types'

/** 许可协议相关状态与预览逻辑。 */
export function useLicensePreview(
	Vue: typeof VueTypes,
	api: mw.Api,
	trademark: VueTypes.Ref<boolean>,
) {
	const { ref, computed, watch, onUnmounted } = Vue

	const license = ref('Copyright')
	const licenseOptions = buildLicenseMenu()
	const licenseFieldValues = ref<Record<string, string>>({})
	const licenseHint = ref('')
	const licensePreviewHtml = ref('')
	const licensePreviewLoading = ref(false)

	let licensePreviewTimer: ReturnType<typeof setTimeout> | undefined
	let licenseSeq: number | undefined

	const currentLicense = computed(
		() => LICENSES.flatMap((g) => g.options).find((o) => o.tpl === license.value) ?? null,
	)
	const currentLicenseFields = computed(() => {
		const o = currentLicense.value
		if (!o) {
			return []
		}
		return (o.fields ?? []).map((f) => {
			const key = o.tpl + '|' + f.key
			return {
				key,
				label: f.label,
				type: f.type,
				placeholder: f.placeholder || '',
				menuItems: (f.options ?? []).map((opt) => ({ value: opt, label: opt })),
			}
		})
	})
	const licenseParams = computed(() => {
		const o = currentLicense.value
		if (!o) {
			return ''
		}
		const vals: Record<string, string> = {}
		const lfv = licenseFieldValues.value
		;(o.fields ?? []).forEach((f) => {
			vals[f.key] = lfv[o.tpl + '|' + f.key] ?? ''
		})
		return o.build ? o.build(vals) : ''
	})

	function updateLicenseHint() {
		const o = currentLicense.value
		licenseHint.value = o?.missing ? msg('license-missing-tpl') : ''
	}

	// 许可预览通过 action=parse 渲染，其输出 HTML 已由解析器消毒，
	// 再经 v-html 注入。模板名来自白名单 LICENSES，字段值经 escapeTemplateParam 转义。
	function fetchLicensePreview() {
		const o = currentLicense.value
		if (!o) {
			licensePreviewHtml.value = ''
			return
		}
		clearTimeout(licensePreviewTimer)
		const seq = (licenseSeq = (licenseSeq ?? 0) + 1)
		licensePreviewTimer = setTimeout(async () => {
			let text = '{{' + license.value + licenseParams.value + '}}'
			if (trademark.value) {
				text += '{{Trademark}}'
			}
			licensePreviewLoading.value = true
			try {
				const data = (await api.get({
					action: 'parse',
					text,
					contentmodel: 'wikitext',
					prop: 'text',
					disablelimitreport: 1,
					formatversion: 2,
				})) as ApiParseResponse
				if (seq !== licenseSeq) {
					return // 已有更新的预览请求，丢弃过期结果
				}
				licensePreviewHtml.value = data.parse?.text || ''
			} catch {
				if (seq === licenseSeq) {
					licensePreviewHtml.value = ''
				}
			} finally {
				if (seq === licenseSeq) {
					licensePreviewLoading.value = false
				}
			}
		}, 350)
	}

	watch(license, () => {
		const o = currentLicense.value
		if (o) {
			;(o.fields ?? []).forEach((f) => {
				const key = o.tpl + '|' + f.key
				licenseFieldValues.value[key] ??= f.def || ''
			})
		}
		updateLicenseHint()
		fetchLicensePreview()
	})
	watch(
		licenseFieldValues,
		() => {
			fetchLicensePreview()
		},
		{ deep: true },
	)
	watch(trademark, () => {
		fetchLicensePreview()
	})
	onUnmounted(() => {
		clearTimeout(licensePreviewTimer)
	})

	return {
		license,
		licenseOptions,
		licenseFieldValues,
		licenseHint,
		licensePreviewHtml,
		licensePreviewLoading,
		currentLicense,
		currentLicenseFields,
		licenseParams,
		updateLicenseHint,
		fetchLicensePreview,
	}
}
