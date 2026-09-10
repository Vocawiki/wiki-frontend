import {
	cdxIconUpload,
	cdxIconReload,
	cdxIconArrowPrevious,
	cdxIconFolderPlaceholder,
	cdxIconHelp,
} from '@wikimedia/codex-icons'

import { createApi } from './api'
import { createUploadComponent } from './component'
import type { CodexType, VueType } from './types'

export function mountApp({ Vue, Codex }: { Vue: VueType; Codex: CodexType }) {
	const form = document.getElementById('mw-upload-form')
	const desc = document.getElementById('wpUploadDescription') as HTMLTextAreaElement | null
	if (!form || !desc) {
		throw new Error('当前页面未找到`#mw-upload-form`和`#wpUploadDescription`')
	}

	/** 检测重新上传 */
	const isReupload = new URLSearchParams(location.search).get('wpForReUpload') === '1'

	/** 隐藏原生表单可见部分 */
	form.querySelectorAll<HTMLElement>('fieldset').forEach((f) => {
		f.style.display = 'none'
	})
	const uploadText = document.getElementById('uploadtext')
	const uploadTextHtml = uploadText?.innerHTML ?? ''
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

	const initialDesc = desc.value
	const hasExisting = initialDesc.trim() !== ''
	const srcMatch = initialDesc.match(/^\*\s*来源[：:]\s*(.+)$/m)
	const presetSource = srcMatch ? srcMatch[1]!.trim() : ''

	/** 挂载Vue  */
	const app = createUploadComponent({
		Vue,
		api: createApi(),
		form,
		presetSource,
		initialDesc,
		hasExisting,
		isReupload,
		uploadIcon: cdxIconUpload,
		restartIcon: cdxIconReload,
		backIcon: cdxIconArrowPrevious,
		batchIcon: cdxIconFolderPlaceholder,
		helpIcon: cdxIconHelp,
		uploadTextHtml,
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
		.component('cdx-dialog', Codex.CdxDialog)
		.mount(mount)
}
