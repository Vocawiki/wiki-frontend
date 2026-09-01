type MessageTable = Record<string, string>

const tr = (hans: string, hant: string, hk?: string): string =>
	wgULS(hans, hant, undefined, undefined, hk)

const MESSAGES = {
	// 提示
	'err-no-file': tr('请选择要上传的文件。', '請選擇要上傳的檔案。', '請選擇要上載的檔案。'),
	'err-no-url': tr('请填写文件网址。', '請填寫檔案網址。'),
	'err-no-dest': tr('请填写目标文件名。', '請填寫目標檔案名。'),
	'err-exists': tr(
		'目标文件已存在，如需覆盖请勾选“忽略所有警告”。',
		'目標檔案已存在，如需覆蓋請勾選「忽略所有警告」。',
	),
	'err-badfilename': tr('目标文件名不合法：$1', '目標檔案名不合法：$1'),
	'err-required': tr('请填写必填项：$1', '請填寫必填項：$1'),
	'err-blocked': tr('上传被阻止：$1', '上傳被阻止：$1', '上載被阻止：$1'),
	'err-upload-failed': tr('上传失败', '上傳失敗', '上載失敗'),
	'success-uploaded': tr('上传成功', '上傳成功', '上載成功'),
	'license-missing-tpl': tr('模板尚未创建。', '模板尚未建立。'),

	// wikitext
	'wikitext-summary': '== 摘要 ==',
	'wikitext-license': '== 许可协议 ==',
	'wikitext-source': '* 来源：',
	'wikitext-author': '* 作者：',
	'wikitext-category': '[[分类:$1]]',
	'wikitext-author-category': '[[分类:作者:$1]]',

	// UI
	'notice-existing-desc': tr(
		'检测到已有描述内容，提交时将用下方内容覆盖。',
		'偵測到已有描述內容，提交時將用下方內容覆蓋。',
	),
	'source-section': tr('来源文件', '來源檔案'),
	'source-local': tr('从本地选择文件', '從本機選擇檔案'),
	'source-url': tr('从网址获取', '從網址取得'),
	'btn-choose-file': tr('选择文件', '選擇檔案'),
	'btn-rechoose-file': tr('重新选择文件', '重新選擇檔案'),
	'placeholder-file-url': tr(
		'https://…（可公开访问的图片直链）',
		'https://…（可公開存取的圖片直連）',
	),
	'notice-types': tr('允许类型：$1', '允許類型：$1'),
	'notice-max-size': tr('最大 $1', '最大 $1'),
	'preview-file-empty': tr('尚未选择文件', '尚未選擇檔案'),
	'dest-section': tr('目标文件名', '目標檔案名'),
	'placeholder-dest': tr('留空则使用原文件名', '留空則使用原檔案名'),
	'dest-exists-prefix': tr(
		'同名文件已存在，如果您不确定是否要覆盖它，请检查 ',
		'同名檔案已存在，如果您不確定是否要覆蓋它，請檢查 ',
	),
	'desc-section': tr('文件描述', '檔案描述'),
	'source-page-label': tr('来源', '來源'),
	'placeholder-source-page': tr('网页链接或文字出处', '網頁連結或文字出處'),
	'character-label': tr('对象', '對象'),
	'placeholder-character': tr('图片中出现的人物', '圖片中出現的人物'),
	'no-results-hint': tr('无匹配结果，回车可直接添加', '無相符結果，按Enter可直接新增'),
	'hint-disambig': tr('消歧义', '消歧義'),
	'missing-character-prefix': tr(
		'以下对象分类不存在，提交后将显示红链：',
		'以下對象分類不存在，提交後將顯示紅鏈：',
	),
	'author-label': tr('作者', '作者'),
	'placeholder-author': tr('图片的作者', '圖片的作者'),
	'missing-author-prefix': tr(
		'以下作者分类不存在，提交后将显示红链：',
		'以下作者分類不存在，提交後將顯示紅鏈：',
	),
	'function-label': tr('功能分类', '功能分類'),
	'placeholder-function': tr('图片的用途或性质', '圖片的用途或性質'),
	'license-section': tr('许可协议', '授權協議'),
	'license-default-label': tr('未选定', '未選取'),
	'trademark-label': tr('含有商标', '含有商標'),
	'license-loading': tr('正在生成许可协议预览……', '正在產生授權協議預覽……'),
	'desc-preview-section': tr('描述预览', '描述預覽'),
	'preview-edited': tr('已手动编辑，表单变化不再自动覆盖。', '已手動編輯，表單變更不再自動覆蓋。'),
	'btn-reset-preview': tr('重置为自动生成', '重設為自動產生'),
	'ai-generated-label': '由AI生成',
	'uploadtext-title': tr('上传说明', '上傳說明'),
	'btn-back-to-native': tr('返回旧版', '返回舊版'),
	'btn-batch-upload': tr('批量上传', '批次上傳', '批次上載'),
	'note-section': tr('备注', '備註'),
	'placeholder-note': tr('编辑摘要', '編輯摘要'),
	'options-section': tr('上传选项', '上傳選項'),
	'watch-label': tr('监视此文件', '監視此檔案'),
	'ignore-warnings-label': tr('忽略所有警告', '忽略所有警告'),
	'btn-submitting': tr('正在上传……', '正在上傳……', '正在上載……'),
	'btn-submit': tr('上传文件', '上傳檔案', '上載檔案'),
} satisfies MessageTable

export type MessageKey = keyof typeof MESSAGES

export const msg = (key: MessageKey, ...params: string[]): string => {
	const template = MESSAGES[key] ?? key
	return params.length
		? template.replace(/\$(\d+)/g, (_, n) => params[Number(n) - 1] ?? '')
		: template
}
