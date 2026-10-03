// oxlint-disable max-lines-per-function
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

/** 从API的error.info里取出异常类名。 */
const EXCEPTION_RE = /Caught exception of type ([\w\\]+)/u

/**
 * 这些警告只在`exists`成立时才会一起返回，
 * 本身不说明任何新情况，单独显示反而会盖掉真正的原因。
 */
const SECONDARY_WARNINGS = ['nochange', 'duplicateversions']

/**
 * 把警告值转成可读文本。MediaWiki的警告值可能是字符串、字符串数组，
 * 也可能是{fileName,timestamp}对象。
 */
const warningText = (value: unknown): string => {
	if (typeof value === 'string') return value
	if (Array.isArray(value)) {
		return value.map((v) => warningText(v)).filter(Boolean).join('、')
	}
	if (typeof value === 'object' && value !== null) {
		const o = value as { fileName?: string; timestamp?: string }
		return o.fileName ?? o.timestamp ?? ''
	}
	return ''
}

/** 警告码对应的文案；没有列出的走err-warning-unknown。 */
const WARNING_MESSAGES: Record<string, Parameters<typeof msg>[0]> = {
	exists: 'err-exists',
	'page-exists': 'err-page-exists',
	'bad-prefix': 'err-bad-prefix',
	'was-deleted': 'err-was-deleted',
	'duplicate-archive': 'err-duplicate-archive',
	duplicate: 'err-duplicate',
	badfilename: 'err-badfilename',
	'filetype-unwanted-type': 'err-filetype-unwanted-type',
	'large-file': 'err-large-file',
	'empty-file': 'err-empty-file',
}

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

	/** 传输层失败：显示mw.Api的请求编号与文案。 */
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

	/** 服务器内部错误：MediaWiki只给英文异常名，换成可读文案并保留编号。 */
	function reportApiError(info: string): void {
		console.error('上传时服务器内部错误：', info)
		const name = EXCEPTION_RE.exec(info)?.[1]
		const requestId = REQUEST_ID_RE.exec(info)?.[1]
		if (!name) {
			notifyError(info)
			return
		}
		const message = msg('err-server-error', name)
		if (!requestId) {
			notifyError(message)
			return
		}
		notifyError($('<div>').append(message, $('<div>').text(msg('err-http-id', requestId))))
	}

	function fail(code: string | null, result: UploadResponse | ApiTransportError): void {
		// 传输层失败时载荷里没有error/errors字段，直接交给mw.Api自己的渲染器
		if (isTransportError(result)) {
			reportTransportError(code, result)
			return
		}
		const w = result.upload?.warnings
		if (w) {
			// 跳过只起补充作用的次要警告，取第一个真正要说明情况的
			const key = Object.keys(w).find((k) => !SECONDARY_WARNINGS.includes(k))
			if (key) {
				const id = WARNING_MESSAGES[key]
				const value = warningText(w[key])
				// 不认识的警告也要把code和内容说出来
				notifyError(id ? msg(id, value) : msg('err-warning-unknown', key, value))
				return
			}
		}
		if (result.errors?.[0]?.['*']) {
			notifyError(result.errors[0]['*'])
		} else if (result.error?.info) {
			reportApiError(result.error.info)
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
		const buildParams = (name: string): Record<string, string | boolean> => {
			const p: Record<string, string | boolean> = {
				filename: name,
				comment: (deps.note.value || '').trim(),
				watchlist: deps.watchFile.value ? 'watch' : 'nochange',
				ignorewarnings: deps.isReupload || deps.ignoreWarnings.value,
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
			let result = await sendOnce(buildParams(finalFilename))
			// 拿MW给出的改名重传一次
			if (result.upload?.result === 'Warning' && result.upload.warnings?.badfilename) {
				finalFilename = String(result.upload.warnings.badfilename)
				result = await sendOnce(buildParams(finalFilename))
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
