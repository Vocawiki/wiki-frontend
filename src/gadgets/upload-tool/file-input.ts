import type * as VueTypes from 'vue'

import { msg } from './i18n'
import { formatBytes } from './utils'

interface FileInputDeps {
	fileName: VueTypes.Ref<string>
	filePreview: VueTypes.Ref<string>
	fileMeta: VueTypes.Ref<string>
	fileError: VueTypes.Ref<string>
	destFile: VueTypes.Ref<string>
	isReupload: boolean
	maxUploadBytes: number
}

/** 本地文件选择、预览与元信息读取。 */
export function useFileInput(Vue: typeof VueTypes, deps: FileInputDeps) {
	const { onMounted, onUnmounted } = Vue

	function chooseFile() {
		const f = document.getElementById('wpUploadFile')
		if (f) {
			f.click()
		}
	}

	// 预检文件大小
	function validateFile(f: File): void {
		if (deps.maxUploadBytes > 0 && f.size > deps.maxUploadBytes) {
			deps.fileError.value = msg('err-file-too-large', formatBytes(deps.maxUploadBytes))
			return
		}
		deps.fileError.value = ''
	}

	let objectUrl: string | undefined
	let fileEl: HTMLInputElement | null

	function onChange() {
		const f = fileEl?.files?.[0]
		deps.fileName.value = f ? f.name : ''
		deps.filePreview.value = ''
		deps.fileMeta.value = ''
		deps.fileError.value = ''
		// 释放上一张测量用的object URL
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl)
			objectUrl = undefined
		}
		if (f) {
			validateFile(f)
			deps.fileMeta.value = formatBytes(f.size)
			if (f.type?.startsWith('image/')) {
				const reader = new FileReader()
				reader.onload = (ev) => {
					deps.filePreview.value = (ev.target?.result as string) || ''
				}
				reader.readAsDataURL(f)
				objectUrl = URL.createObjectURL(f)
				const img = new Image()
				img.onload = () => {
					deps.fileMeta.value = `${img.width} × ${img.height}, ${formatBytes(f.size)}`
					if (objectUrl) {
						URL.revokeObjectURL(objectUrl)
						objectUrl = undefined
					}
				}
				img.src = objectUrl
			}
			// 直接用文件名填充目标名，避免依赖MW原生fillDestFile的时序。
			// 重新上传时目标名已由页面预填且禁用，不要覆盖。
			if (!deps.isReupload) {
				deps.destFile.value = f.name
			}
		}
	}

	onMounted(() => {
		fileEl = document.getElementById('wpUploadFile') as HTMLInputElement | null
		if (!fileEl) return
		fileEl.addEventListener('change', onChange)
	})

	onUnmounted(() => {
		if (fileEl) {
			fileEl.removeEventListener('change', onChange)
		}
		if (objectUrl) {
			URL.revokeObjectURL(objectUrl)
		}
	})

	return { chooseFile }
}
