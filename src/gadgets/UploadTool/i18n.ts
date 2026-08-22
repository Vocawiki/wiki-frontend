type MessageTable = Record<string, string>

/** zh-hans */
const MESSAGES_HANS = {
	// 提示
	'err-no-file': '请选择要上传的文件。',
	'err-no-url': '请填写文件网址。',
	'err-no-dest': '请填写目标文件名。',
	'err-exists': '目标文件已存在，如需覆盖请勾选“忽略所有警告”。',
	'err-badfilename': '目标文件名不合法：$1',
	'err-required': '请填写必填项：$1',
	'err-blocked': '上传被阻止：$1',
	'err-upload-failed': '上传失败',
	'success-uploaded': '上传成功',
	'license-missing-tpl': '模板尚未创建。',

	// wikitext
	'wikitext-summary': '== 摘要 ==',
	'wikitext-license': '== 许可协议 ==',
	'wikitext-source': '*来源：',
	'wikitext-author': '*作者：',
	'wikitext-category': '[[分类:$1]]',
	'wikitext-author-category': '[[分类:作者:$1]]',

	// UI
	'notice-existing-desc': '检测到已有描述内容，提交时将用下方内容覆盖。',
	'source-section': '来源文件',
	'source-local': '从本地选择文件',
	'source-url': '从网址获取',
	'btn-choose-file': '选择文件',
	'btn-rechoose-file': '重新选择文件',
	'placeholder-file-url': 'https://…（可公开访问的图片直链）',
	'notice-types': '允许类型：$1',
	'notice-max-size': '最大 $1',
	'preview-file-empty': '尚未选择文件',
	'dest-section': '目标文件名',
	'placeholder-dest': '留空则使用原文件名',
	'dest-exists-prefix': '同名文件已存在，如果您不确定是否要覆盖它，请检查 ',
	'desc-section': '文件描述',
	'source-page-label': '来源',
	'placeholder-source-page': '网页链接或文字出处',
	'character-label': '对象',
	'placeholder-character': '图片中出现的人物',
	'no-results-hint': '无匹配结果，回车可直接添加',
	'hint-disambig': '消歧义',
	'missing-character-prefix': '以下对象分类不存在，提交后将显示红链：',
	'author-label': '作者',
	'placeholder-author': '图片的作者',
	'missing-author-prefix': '以下作者分类不存在，提交后将显示红链：',
	'function-label': '功能分类',
	'placeholder-function': '图片的用途或性质',
	'license-section': '许可协议',
	'license-default-label': '未选定',
	'trademark-label': '含有商标',
	'license-loading': '正在生成许可协议预览…',
	'desc-preview-section': '描述预览',
	'preview-edited': '已手动编辑，表单变化不再自动覆盖。',
	'btn-reset-preview': '重置为自动生成',
	'note-section': '备注',
	'placeholder-note': '编辑摘要',
	'options-section': '上传选项',
	'watch-label': '监视此文件',
	'ignore-warnings-label': '忽略所有警告',
	'btn-submitting': '正在上传……',
	'btn-submit': '上传文件',
} satisfies MessageTable

export type MessageKey = keyof typeof MESSAGES_HANS

/** zh-hant */
const MESSAGES_HANT = {
	'err-no-file': '請選擇要上傳的檔案。',
	'err-no-url': '請填寫檔案網址。',
	'err-no-dest': '請填寫目標檔案名。',
	'err-exists': '目標檔案已存在，如需覆蓋請勾選「忽略所有警告」。',
	'err-badfilename': '目標檔案名不合法：$1',
	'err-required': '請填寫必填項：$1',
	'err-blocked': '上傳被阻止：$1',
	'err-upload-failed': '上傳失敗',
	'success-uploaded': '上傳成功',
	'license-missing-tpl': '模板尚未建立。',

	'wikitext-summary': '== 摘要 ==',
	'wikitext-license': '== 授權協議 ==',
	'wikitext-source': '*來源：',
	'wikitext-author': '*作者：',
	'wikitext-category': '[[分類:$1]]',
	'wikitext-author-category': '[[分類:作者:$1]]',

	'notice-existing-desc': '偵測到已有描述內容，提交時將用下方內容覆蓋。',
	'source-section': '來源檔案',
	'source-local': '從本機選擇檔案',
	'source-url': '從網址取得',
	'btn-choose-file': '選擇檔案',
	'btn-rechoose-file': '重新選擇檔案',
	'placeholder-file-url': 'https://…（可公開存取的圖片直連）',
	'notice-types': '允許類型：$1',
	'notice-max-size': '最大 $1',
	'preview-file-empty': '尚未選擇檔案',
	'dest-section': '目標檔案名',
	'placeholder-dest': '留空則使用原檔案名',
	'dest-exists-prefix': '同名檔案已存在，如果您不確定是否要覆蓋它，請檢查 ',
	'desc-section': '檔案描述',
	'source-page-label': '來源',
	'placeholder-source-page': '網頁連結或文字出處',
	'character-label': '對象',
	'placeholder-character': '圖片中出現的人物',
	'no-results-hint': '無相符結果，按 Enter 可直接新增',
	'hint-disambig': '消歧義',
	'missing-character-prefix': '以下對象分類不存在，提交後將顯示紅鏈：',
	'author-label': '作者',
	'placeholder-author': '圖片的作者',
	'missing-author-prefix': '以下作者分類不存在，提交後將顯示紅鏈：',
	'function-label': '功能分類',
	'placeholder-function': '圖片的用途或性質',
	'license-section': '授權協議',
	'license-default-label': '未選取',
	'trademark-label': '含有商標',
	'license-loading': '正在產生授權協議預覽…',
	'desc-preview-section': '描述預覽',
	'preview-edited': '已手動編輯，表單變更不再自動覆蓋。',
	'btn-reset-preview': '重設為自動產生',
	'note-section': '備註',
	'placeholder-note': '編輯摘要',
	'options-section': '上傳選項',
	'watch-label': '監視此檔案',
	'ignore-warnings-label': '忽略所有警告',
	'btn-submitting': '正在上傳……',
	'btn-submit': '上傳檔案',
} satisfies Record<MessageKey, string>

/** zh-HK */
const MESSAGES_HK: Partial<Record<MessageKey, string>> = {
	'err-no-file': '請選擇要上載的檔案。',
	'err-blocked': '上載被阻止：$1',
	'err-upload-failed': '上載失敗',
	'success-uploaded': '上載成功',
	'btn-submitting': '正在上載……',
	'btn-submit': '上載檔案',
}

const HANT_VARIANTS = new Set(['zh-hant', 'zh-tw'])
const HK_VARIANTS = new Set(['zh-hk', 'zh-mo'])

/** 纯函数：给定语言变体与消息键，返回最终文案。 */
export const pickMessage = (variant: string, key: MessageKey): string => {
	if (HK_VARIANTS.has(variant)) {
		return MESSAGES_HK[key] ?? MESSAGES_HANT[key] ?? MESSAGES_HANS[key] ?? key
	}
	if (HANT_VARIANTS.has(variant)) {
		return MESSAGES_HANT[key] ?? MESSAGES_HANS[key] ?? key
	}
	return MESSAGES_HANS[key] ?? key
}

const pick = (key: MessageKey): string => pickMessage(mw.config.get('wgUserVariant')! || 'zh-hans', key)

export const msg = (key: MessageKey, ...params: string[]): string => {
	const template = pick(key)
	return params.length
		? template.replace(/\$(\d+)/g, (_, n) => params[Number(n) - 1] ?? '')
		: template
}
