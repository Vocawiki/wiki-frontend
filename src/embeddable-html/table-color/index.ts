/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:TableColor?action=history
 */
// TODO(参数): name / border / header / body 原本由 {{#widget:TableColor|name=|border=|header=|body=}} 传入，
// 静态渲染阶段无法取值，需要改为从表格容器的 data-* 属性读取后再补齐。
const name = ''
const border = ''
const header = ''
const body = ''

window.RLQ ??= []
// @ts-expect-error RLQ 也支持只传回调，但类型定义仅允许 [依赖, 回调] 元组
window.RLQ.push(() => {
	const tag = `.wikitable-${name.replace(/[^0-9a-z-]/giu, '')}`
	const borderColor = border.replace(/[^0-9a-f]/giu, '')
	const headerColor = header.replace(/[^0-9a-f]/giu, '')
	const bodyColor = body.replace(/[^0-9a-f]/giu, '')
	mw.loader.addStyleTag(
		`${tag}{background:#${borderColor}}` +
			`${tag} th{background:#${headerColor}}` +
			`${tag} td{background:#${bodyColor}}`,
	)
})
