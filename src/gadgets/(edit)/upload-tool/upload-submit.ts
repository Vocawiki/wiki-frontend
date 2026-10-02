// oxlint-disable complexity max-lines-per-function
import type * as VueTypes from 'vue'

import { msg } from './i18n'
import type { LicenseOption, UploadResponse } from './types'
import { notifyError, notifySuccess } from './utils'

/** mw.Api在传输层失败时的reject载荷：HTTP错误、断网、超时或响应非JSON。 */
interface ApiTransportError {
	xhr?: { responseText?: string }
	textStatus?: string
	exception?: string
}

/** 传输层失败的载荷没有error/errors字段，只能靠xhr识别。 */
const isTransportError = (result: unknown): result is ApiTransportError =>
	typeof result === 'object' && result !== null && 'xhr' in result

/** 从MediaWiki的HTML错误页里取出请求编号。 */
const REQUEST_ID_RE = /\[([\w@.-]{1,64})\]\s+\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/u

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
			location.href = mw.util.getUrl(`File:${filename}`)
		}, 500)
	}

	/** 传输层失败：显示mw.Api的文案，并把请求编号带出来供站务排查。 */
	function reportTransportError(code: string | null, result: ApiTransportError): void {
		// 完整信息留在控制台，用于分辨是MediaWiki、网关还是网络的问题
		console.error('上传请求在传输层失败：', code, result.textStatus, result.xhr, result.exception)
		// 展开成对象字面量：interface没有隐式索引签名，无法直接传给mw.Api#getErrorMessage
		const message = deps.api.getErrorMessage({ ...result })
		// 错误页里`[编号]`与时间之间可能夹着标签，先剥掉标签再取编号
		const responseText = (result.xhr?.responseText ?? '').replace(/<[^>]*>/gu, '')
		const requestId = REQUEST_ID_RE.exec(responseText)?.[1]
		if (!requestId) {
			notifyError(message)
			return
		}
		notifyError($('<div>').append(message, $('<div>').text(msg('err-http-id', requestId))))
	}

	function fail(code: string | null, result: UploadResponse | ApiTransportError): void {
		// 传输层失败时mw.Api以('http', { xhr, textStatus, exception })reject，
		// 载荷里没有error/errors字段，直接交给mw.Api自己的渲染器
		if (isTransportError(result)) {
			reportTransportError(code, result)
			return
		}
		const w = result.upload?.warnings
		const wstr = (k: string): string => {
			const s = w?.[k]
			if (s === undefined) return ''
			return typeof s === 'string' ? s : s.join('；')
		}
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
			const dup = Array.isArray(w.duplicate) ? (w.duplicate[0] ?? '') : w.duplicate
			notifyError(msg('err-duplicate', dup))
		} else if (w?.badfilename) {
			notifyError(msg('err-badfilename', wstr('badfilename')))
		} else if (result.errors?.[0]?.['*']) {
			notifyError(result.errors[0]['*'])
		} else if (result.error?.info) {
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
				watchlist: deps.watchFile.value ? 'watch' : 'nochange',
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
					.fail((code: string, result: UploadResponse | ApiTransportError) => {
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
				const err = e as { result?: UploadResponse | ApiTransportError; message?: string }
				const result = err.result
				if (
					!isTransportError(result) &&
					(result?.upload?.result === 'Warning' || result?.upload?.result === 'Success')
				) {
					return result
				}
				throw e
			}
		}
		submitting.value = true
		try {
			// 文件扩展名补全
			let result = await sendOnce(buildParams(finalFilename, false))
			// 拿MW给出的改名重传一次
			if (result.upload?.result === 'Warning' && result.upload.warnings?.badfilename) {
				finalFilename = String(result.upload.warnings.badfilename)
				result = await sendOnce(buildParams(finalFilename, true))
			}
			if (result.upload?.result === 'Warning') {
				fail(null, result)
				return
			}
			finishUpload(result.upload?.filename || finalFilename)
		} catch (e) {
			// 真实失败：缺文件、缺文件名、或重传后撞其它警告
			const err = e as { code?: string; result?: UploadResponse | ApiTransportError; message?: string }
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
				(f) => f.required && !(deps.licenseFieldValues.value[`${o.tpl}|${f.key}`] ?? '').trim(),
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
