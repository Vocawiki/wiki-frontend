import type * as VueTypes from 'vue'

import { msg } from './i18n'
import { formatBytes } from './utils'

interface FileInputDeps {
	form: HTMLElement
	fileName: VueTypes.Ref<string>
	filePreview: VueTypes.Ref<string>
	fileMeta: VueTypes.Ref<string>
	fileError: VueTypes.Ref<string>
	destFile: VueTypes.Ref<string>
	isReupload: boolean
	maxUploadBytes: number
	allowedExtensions: string[]
}

/** 取小写扩展名；没有扩展名时返回空串。 */
function extensionOf(name: string): string {
	const n = name.lastIndexOf('.')
	return n > 0 ? name.slice(n + 1).toLowerCase() : ''
}

/**
 * 预检文件大小与扩展名。
 * 扩展名不在允许列表时MW会直接拒绝并把input清空，
 * 客户端先拦一次，免得文件凭空消失却一句话都没有。
 */
function validateFile(f: File, deps: FileInputDeps): boolean {
	if (deps.maxUploadBytes > 0 && f.size > deps.maxUploadBytes) {
		deps.fileError.value = msg('err-file-too-large', formatBytes(deps.maxUploadBytes))
		return false
	}
	const allowed = deps.allowedExtensions.map((e) => e.toLowerCase())
	if (allowed.length > 0 && !allowed.includes(extensionOf(f.name))) {
		deps.fileError.value = msg('err-file-type', f.name)
		return false
	}
	deps.fileError.value = ''
	return true
}

/** 本地文件选择、预览与元信息读取。 */
export function useFileInput(Vue: typeof VueTypes, deps: FileInputDeps) {
	const { onMounted, onUnmounted } = Vue

	let objectUrl: string | undefined
	let fileEl: HTMLInputElement | null
	/** 上一次由本函数写入目标名的值，用来区分自动填写和用户修改 */
	let lastAutoName = ''

	function chooseFile() {
		const f = document.getElementById('wpUploadFile')
		if (f) {
			f.click()
		}
	}

	/** 释放上一张测量用的object URL。 */
	function releaseObjectUrl() {
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl)
			objectUrl = undefined
		}
	}

	/** 清空上一张留下的状态。 */
	function clearState() {
		deps.fileName.value = ''
		deps.filePreview.value = ''
		deps.fileMeta.value = ''
		deps.fileError.value = ''
		releaseObjectUrl()
	}

	/** 读取图片预览与尺寸。 */
	function updatePreview(f: File) {
		deps.fileMeta.value = formatBytes(f.size)
		if (!f.type.startsWith('image/')) return
		const reader = new FileReader()
		reader.onload = (ev) => {
			deps.filePreview.value = (ev.target?.result as string) || ''
		}
		reader.readAsDataURL(f)
		objectUrl = URL.createObjectURL(f)
		const img = new Image()
		img.onload = () => {
			deps.fileMeta.value = `${img.width} × ${img.height}, ${formatBytes(f.size)}`
			releaseObjectUrl()
		}
		img.src = objectUrl
	}

	/** 监听挂在表单的捕获阶段change事件，取文件输入的值。 */
	function onChange(ev: Event) {
		// 捕获阶段会收到表单内所有字段的change，只关心文件输入
		if (ev.target !== fileEl) return
		const files = fileEl?.files
		const f = files?.[0]
		clearState()
		if (!f) return
		// 不合法时只显示错误，不填目标名也不预览。
		if (!validateFile(f, deps)) return
		deps.fileName.value = f.name
		updatePreview(f)
		// 目标名跟随所选文件，但用户自己改过或由URL预填的不能覆盖。
		if (!deps.isReupload && (!deps.destFile.value.trim() || deps.destFile.value === lastAutoName)) {
			deps.destFile.value = f.name
			lastAutoName = f.name
		}
	}

	onMounted(() => {
		fileEl = document.getElementById('wpUploadFile') as HTMLInputElement | null
		if (!fileEl) return
		deps.form.addEventListener('change', onChange, true)
	})

	onUnmounted(() => {
		deps.form.removeEventListener('change', onChange, true)
		releaseObjectUrl()
	})

	return { chooseFile }
}
