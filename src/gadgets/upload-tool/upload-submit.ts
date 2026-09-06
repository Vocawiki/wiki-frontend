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
		const wstr = (k: string): string => (w?.[k] ? String(w[k]) : '')
		if (w?.exists) {
			notifyError(msg('err-exists'))
		} else if (w?.['was-deleted']) {
			// 同名文件曾被删除
			notifyError(msg('err-was-deleted', wstr('was-deleted')))
		} else if (w?.['duplicate-archive']) {
			// 同名同内容文件曾被删除
			notifyError(msg('err-duplicate-archive', wstr('duplicate-archive')))
		} else if (w?.['exists-normalized']) {
			// 文件名规范化后撞已有文件
			notifyError(msg('err-exists-normalized', wstr('exists-normalized')))
		} else if (w?.duplicate) {
			// 同内容文件已存在
			const dup = Array.isArray(w.duplicate) ? (w.duplicate[0] ?? '') : String(w.duplicate)
			notifyError(msg('err-duplicate', dup))
		} else if (w?.badfilename) {
			notifyError(msg('err-badfilename', wstr('badfilename')))
		} else if (result?.errors?.[0]?.['*']) {
			notifyError(result.errors[0]['*'])
		} else if (result?.error?.info) {
			notifyError(result.error.info)
		} else if (w) {
			const k = Object.keys(w)[0] ?? ''
			notifyError(msg('err-blocked', k))
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
		// 文件扩展名补全
		let finalFilename = filename
		const buildParams = (name: string, forceIgnore: boolean): Record<string, string | boolean> => {
			const p: Record<string, string | boolean> = {
				filename: name,
				comment: (deps.note.value || '').trim(),
				watchlist: deps.watchFile.value ? 'watch' : 'unwatch',
				ignorewarnings: deps.isReupload || forceIgnore || deps.ignoreWarnings.value,
			}
			if (!deps.isReupload) {
				p.text = deps.previewText.value
			}
			return p
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
		// 发送一次并取结果
		const sendOnce = async (p: Record<string, string | boolean>): Promise<UploadResponse> => {
			let request: JQuery.Promise<UploadResponse>
			if (deps.sourceType.value === 'url') {
				request = deps.api.postWithToken('csrf', {
					action: 'upload',
					url: (deps.fileUrl.value || '').trim(),
					...p,
				}) as unknown as JQuery.Promise<UploadResponse>
			} else {
				const file = (document.getElementById('wpUploadFile') as HTMLInputElement | null)
					?.files?.[0]
				if (!file) {
					throw new Error(msg('err-no-file'))
				}
				request = deps.api.upload(file, p)
			}
			try {
				return await awaitRequest(request)
			} catch (e) {
				const err = e as { result?: UploadResponse; message?: string }
				if (err.result?.upload?.result === 'Warning' || err.result?.upload?.result === 'Success') {
					return err.result
				}
				throw e
			}
		}
		submitting.value = true
		try {
			// 文件扩展名补全
			let result = await sendOnce(buildParams(finalFilename, false))
			// 拿MW给出的改名重传一次
			if (result?.upload?.result === 'Warning' && result.upload.warnings?.badfilename) {
				finalFilename = String(result.upload.warnings.badfilename)
				result = await sendOnce(buildParams(finalFilename, true))
			}
			if (result?.upload?.result === 'Warning') {
				fail(null, result)
				return
			}
			finishUpload(result?.upload?.filename || finalFilename)
		} catch (e) {
			// 真实失败：缺文件、缺文件名、或重传后撞其它警告
			const err = e as { code?: string; result?: UploadResponse; message?: string }
			if (err.message === msg('err-no-file')) {
				notifyError(err.message)
			} else {
				fail(err.code ?? null, err.result ?? {})
			}
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
