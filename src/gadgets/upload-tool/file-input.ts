import type * as VueTypes from 'vue'

import { formatBytes } from './utils'

interface FileInputDeps {
	fileName: VueTypes.Ref<string>
	filePreview: VueTypes.Ref<string>
	fileMeta: VueTypes.Ref<string>
	destFile: VueTypes.Ref<string>
}

/** 本地文件选择、预览与元信息读取。 */
export function useFileInput(Vue: typeof VueTypes, deps: FileInputDeps) {
	const { onMounted } = Vue

	function chooseFile() {
		const f = document.getElementById('wpUploadFile')
		if (f) {
			f.click()
		}
	}

	onMounted(() => {
		const fileEl = document.getElementById('wpUploadFile') as HTMLInputElement | null
		if (!fileEl) return

		fileEl.addEventListener('change', () => {
			const f = fileEl.files?.[0]
			deps.fileName.value = f ? f.name : ''
			deps.filePreview.value = ''
			deps.fileMeta.value = ''
			if (f) {
				deps.fileMeta.value = formatBytes(f.size)
				if (f.type?.startsWith('image/')) {
					const reader = new FileReader()
					reader.onload = (ev) => {
						deps.filePreview.value = (ev.target?.result as string) || ''
					}
					reader.readAsDataURL(f)
					const img = new Image()
					img.onload = () => {
						deps.fileMeta.value = `${img.width} × ${img.height}, ${formatBytes(f.size)}`
					}
					img.src = URL.createObjectURL(f)
				}
			}
			setTimeout(() => {
				const d = document.getElementById('wpDestFile') as HTMLInputElement | null
				if (!d) return
				deps.destFile.value = d.value
			}, 0)
		})
	})

	return { chooseFile }
}
