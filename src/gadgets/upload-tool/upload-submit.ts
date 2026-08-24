import type * as VueTypes from 'vue'

import { msg } from './i18n'
import type { LicenseOption, UploadResponse } from './types'
import { notifyError, notifySuccess } from './utils'

interface UploadSubmitDeps {
	api: mw.Api
	form: HTMLElement
	isReupload: boolean
	sourceType: VueTypes.Ref<'File' | 'url'>
	fileName: VueTypes.Ref<string>
	fileUrl: VueTypes.Ref<string>
	destFile: VueTypes.Ref<string>
	previewText: VueTypes.Ref<string>
	note: VueTypes.Ref<string>
	watchFile: VueTypes.Ref<boolean>
	ignoreWarnings: VueTypes.Ref<boolean>
	currentLicense: VueTypes.Ref<LicenseOption | null>
	licenseFieldValues: VueTypes.Ref<Record<string, string>>
}

/** 上传提交：客户端校验、请求发出与警告/错误解析。 */
export function useUploadSubmit(Vue: typeof VueTypes, deps: UploadSubmitDeps) {
	const { ref } = Vue

	const submitting = ref(false)

	// 清空文件输入以防止触发离开确认，从而静默跳转到文件页。
	function releaseNativeLeaveConfirmation(): void {
		const fileInput = document.getElementById('wpUploadFile') as HTMLInputElement | null
		if (fileInput) {
			fileInput.value = ''
		}
		$(deps.form).data('origtext', $(deps.form).serialize())
	}

	function finishUpload(filename: string) {
		notifySuccess(msg('success-uploaded'))
		setTimeout(() => {
			releaseNativeLeaveConfirmation()
			location.href = mw.util.getUrl('File:' + filename)
		}, 500)
	}

	function fail(code: string | null, result: UploadResponse): void {
		const w = result?.upload?.warnings
		if (w?.exists) {
			notifyError(msg('err-exists'))
		} else if (w?.badfilename) {
			notifyError(msg('err-badfilename', w.badfilename))
		} else if (result?.errors?.[0]?.['*']) {
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

	async function apiUpload() {
		const filename = (deps.destFile.value || deps.fileName.value || '').trim()
		if (!filename) {
			notifyError(msg('err-no-dest'))
			return
		}
		const params: Record<string, string | boolean> = {
			filename,
			comment: (deps.note.value || '').trim(),
			watchlist: deps.watchFile.value ? 'watch' : 'unwatch',
			ignorewarnings: deps.isReupload ? true : deps.ignoreWarnings.value,
		}
		if (!deps.isReupload) {
			params.text = deps.previewText.value
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
			if (deps.sourceType.value === 'url') {
				params.url = (deps.fileUrl.value || '').trim()
				// URL上传遇警告不会reject，结果走result.upload.warnings，需手动处理
				request = deps.api.postWithToken('csrf', {
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
				request = deps.api.upload(file, params)
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

	function submit() {
		if (submitting.value) {
			return
		}
		// 客户端校验：未选择文件/未填写网址时直接提示，不提交
		if (deps.sourceType.value === 'File' && !deps.fileName.value) {
			notifyError(msg('err-no-file'))
			return
		}
		if (deps.sourceType.value === 'url' && !(deps.fileUrl.value || '').trim()) {
			notifyError(msg('err-no-url'))
			return
		}
		// 许可协议必填字段校验
		const o = deps.currentLicense.value
		if (o) {
			const missing = o.fields.filter(
				(f) =>
					f.required && !String(deps.licenseFieldValues.value[o.tpl + '|' + f.key] ?? '').trim(),
			)
			if (missing.length) {
				notifyError(msg('err-required', missing.map((f) => f.label).join('、')))
				return
			}
		}
		void apiUpload()
	}

	return { submitting, submit }
}
