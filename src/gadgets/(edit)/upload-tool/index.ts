// oxlint-disable no-underscore-dangle
import type { CodexType, VueType } from './types'

declare global {
	interface Window {
		_gadgetUploadToolState?: 'pending' | 'loading' | 'loaded'
	}
}

void conditionalInit()

async function conditionalInit() {
	if (window._gadgetUploadToolState) return
	if (mw.config.get('wgCanonicalSpecialPageName') !== 'Upload') {
		return
	}
	window._gadgetUploadToolState = 'pending'
	await $.ready
	try {
		await init()
		window._gadgetUploadToolState = 'loaded'
	} catch (e) {
		window._gadgetUploadToolState = undefined
		console.error('[upload-tool] 初始化失败', e)
		mw.notify(wgULS('新版界面加载失败，已回退到原始表单', '新版介面載入失敗，已回退到原始表單'), {
			type: 'error',
		})
	}
}

async function init() {
	const [require, mountApp] = await Promise.all([
		mw.loader.using(['vue', '@wikimedia/codex', 'mediawiki.api']),
		import('./init-app').then((x) => x.mountApp),
	])
	mountApp({
		Vue: require('vue') as VueType,
		Codex: require('@wikimedia/codex') as CodexType,
	})
}
