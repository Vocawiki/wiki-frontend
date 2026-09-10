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
	await init()
	window._gadgetUploadToolState = 'loaded'
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
