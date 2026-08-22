import type * as VueTypes from 'vue'

import type { ApiQueryResponse } from './types'

/** 目标文件名查重。 */
export function useDestFileCheck(Vue: typeof VueTypes, api: mw.Api, isReupload: boolean) {
	const { ref, watch, onUnmounted } = Vue

	const destFile = ref('')
	const destFileExists = ref(false)
	const destFileThumb = ref('')
	const destFileUrl = ref('')

	let destSeq: number | undefined
	let destCheckTimer: ReturnType<typeof setTimeout> | undefined

	function checkDestFile(name: string) {
		// 重新上传时无需提示同名
		if (isReupload) {
			destFileExists.value = false
			destFileThumb.value = ''
			destFileUrl.value = ''
			return
		}
		name = (name || '').trim()
		clearTimeout(destCheckTimer)
		if (!name) {
			destFileExists.value = false
			destFileThumb.value = ''
			destFileUrl.value = ''
			return
		}
		const seq = (destSeq = (destSeq ?? 0) + 1)
		destCheckTimer = setTimeout(async () => {
			try {
				const data = (await api.get({
					action: 'query',
					redirects: 1,
					titles: 'File:' + name,
					prop: 'imageinfo',
					iiprop: 'url',
					iiurlwidth: 300,
					formatversion: 2,
				})) as ApiQueryResponse
				if (seq !== destSeq) {
					return // 已有更新的检查请求，丢弃过期结果
				}
				const page = data.query?.pages?.[0]
				if (page && !page.missing) {
					destFileExists.value = true
					destFileThumb.value = page.imageinfo?.[0]?.thumburl || ''
					destFileUrl.value = mw.util.getUrl(page.title)
				} else {
					destFileExists.value = false
					destFileThumb.value = ''
					destFileUrl.value = ''
				}
			} catch {
				if (seq === destSeq) {
					destFileExists.value = false
					destFileThumb.value = ''
					destFileUrl.value = ''
				}
			}
		}, 400)
	}

	watch(destFile, (v) => {
		checkDestFile(v)
	})
	onUnmounted(() => {
		clearTimeout(destCheckTimer)
	})

	return { destFile, destFileExists, destFileThumb, destFileUrl, checkDestFile }
}
