import type * as CodexTypes from '@wikimedia/codex'
import type * as VueTypes from 'vue'
import { cdxIconReload, cdxIconUpload } from '@wikimedia/codex-icons'

import { createApi } from './api'
import { createUploadComponent } from './component'

const UPLOAD_ICON: string = cdxIconUpload
const RESTART_ICON: string = cdxIconReload

declare global {
	interface Window {
		UPLOAD_TOOL_LOADED?: boolean
	}
}

function init(): void {
	if (window.UPLOAD_TOOL_LOADED) {
		return
	}
	if (mw.config.get('wgCanonicalSpecialPageName') !== 'Upload') {
		return
	}
	window.UPLOAD_TOOL_LOADED = true

	const form = document.getElementById('mw-upload-form')
	const desc = document.getElementById('wpUploadDescription') as HTMLTextAreaElement | null
	if (!form || !desc) {
		return
	}

	/** 检测重新上传 */
	let isReupload = false
	try {
		isReupload = new URLSearchParams(location.search).get('wpForReUpload') === '1'
	} catch {
		isReupload = false
	}

	/** 隐藏原生表单可见部分 */
	form.querySelectorAll<HTMLElement>('fieldset').forEach((f) => {
		f.style.display = 'none'
	})
	const uploadText = document.getElementById('uploadtext')
	if (uploadText) {
		uploadText.style.display = 'none'
	}
	const nativeSubmit = form.querySelector<HTMLInputElement>('input[name=wpUpload]')
	if (nativeSubmit) {
		nativeSubmit.style.display = 'none'
	}

	const mount = document.createElement('div')
	mount.id = 'ut-app'
	form.insertBefore(mount, form.firstChild)

	const initialDesc = String(desc.value ?? '')
	const hasExisting = initialDesc.trim() !== ''
	const srcMatch = initialDesc.match(/^\*\s*来源[：:]\s*(.+)$/m)
	const presetSource = srcMatch?.[1]?.trim() ?? ''

	/** 挂载Vue+Codex  */
	mw.loader.using(['vue', '@wikimedia/codex', 'mediawiki.api', 'jquery']).then((require) => {
		const Vue = require('vue') as typeof VueTypes
		const Codex = require('@wikimedia/codex') as typeof CodexTypes
		const $ = require('jquery') as JQueryStatic

		const app = createUploadComponent({
			Vue,
			api: createApi(),
			jquery: $,
			form,
			presetSource,
			hasExisting,
			isReupload,
			uploadIcon: UPLOAD_ICON,
			restartIcon: RESTART_ICON,
		})
		Vue.createMwApp(app)
			.component('cdx-message', Codex.CdxMessage)
			.component('cdx-radio', Codex.CdxRadio)
			.component('cdx-button', Codex.CdxButton)
			.component('cdx-text-input', Codex.CdxTextInput)
			.component('cdx-field', Codex.CdxField)
			.component('cdx-select', Codex.CdxSelect)
			.component('cdx-checkbox', Codex.CdxCheckbox)
			.component('cdx-chip-input', Codex.CdxChipInput)
			.component('cdx-multiselect-lookup', Codex.CdxMultiselectLookup)
			.component('cdx-icon', Codex.CdxIcon)
			.mount(mount)
	})
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init)
} else {
	init()
}
