import type { LicenseField, LicenseGroup } from './types'
import { escapeTemplateParam } from './utils'

export const CC_VERSIONS = ['4.0', '3.0', '2.5', '2.0', '1.0']

const ccFields = (): LicenseField[] => [
	{ key: 'ver', label: '版本', type: 'select', options: CC_VERSIONS, def: '4.0' },
]
const ccBuild = (v: Record<string, string>) => '|' + (v.ver || '4.0')

const osFields = (): LicenseField[] => [
	{ key: 'year', label: '年份（选填）', type: 'text', placeholder: '如2007或2013-present' },
	{ key: 'author', label: '作者/著作权持有人（必填）', type: 'text', required: true },
]
// 保持位置：年份为空也要占位，否则作者会顶到年份参数
const osBuild = (v: Record<string, string>) =>
	'|' + escapeTemplateParam(v.year || '') + '|' + escapeTemplateParam(v.author || '')

const splitNumbered = (str: string | undefined, name: string, out: string[]) => {
	String(str || '')
		.split(/[、,，;；]+/)
		.filter(Boolean)
		.forEach((x, i) => out.push(name + (i === 0 ? '' : i + 1) + '=' + escapeTemplateParam(x)))
}

const authorizedBuild = (v: Record<string, string>) => {
	const params: string[] = []
	splitNumbered(v.authors, '作者名', params)
	splitNumbered(v.proof, '授权证明', params)
	return params.length ? '|' + params.join('|') : ''
}

export const LICENSES: LicenseGroup[] = [
	{
		group: 'CC协议',
		options: [
			{ tpl: 'CC Zero', label: 'CC0（公有领域贡献）', fields: [] },
			{ tpl: 'CC BY', label: 'CC BY（署名）', fields: ccFields(), build: ccBuild },
			{
				tpl: 'CC BY-SA',
				label: 'CC BY-SA（署名-相同方式共享）',
				fields: ccFields(),
				build: ccBuild,
			},
			{
				tpl: 'CC BY-NC-SA',
				label: 'CC BY-NC-SA（署名-非商业-相同方式共享）',
				fields: ccFields(),
				build: ccBuild,
			},
		],
	},
	{
		group: '开源许可',
		options: [
			{ tpl: 'MIT', label: 'MIT许可证', fields: osFields(), build: osBuild },
			{ tpl: 'ISC', label: 'ISC许可证', fields: osFields(), build: osBuild },
		],
	},
	{
		group: '公有领域',
		options: [
			{ tpl: 'PD-Old', label: '作者离世一定年限（PD-Old）', fields: [] },
			{ tpl: 'PD-ineligible', label: '公共财产且无明确作者（PD-ineligible）', fields: [] },
			{ tpl: 'PD-shape', label: '简单几何图形（PD-shape）', fields: [] },
			{ tpl: 'PD-textlogo', label: '几何图形与文字（PD-textlogo）', fields: [] },
			{ tpl: 'PD-Other', label: '其他原因（PD-Other）', fields: [] },
		],
	},
	{
		group: '其他',
		options: [
			{
				tpl: 'Copyright',
				label: '原作者保留权利',
				fields: [{ key: 'author', label: '著作权人（选填）', type: 'text' }],
				build: (v) => (v.author ? '|author=' + escapeTemplateParam(v.author) : ''),
			},
			{
				tpl: 'Authorized',
				label: '原作者授权Vocawiki使用',
				fields: [
					{ key: 'authors', label: '作者名（多个用顿号分隔）', type: 'text' },
					{ key: 'proof', label: '授权证明链接（选填）', type: 'text' },
				],
				build: authorizedBuild,
			},
			{
				tpl: '可自由使用',
				label: '可自由使用',
				fields: [{ key: 'reason', label: '原因（选填）', type: 'text' }],
				build: (v) => (v.reason ? '|' + escapeTemplateParam(v.reason) : ''),
			},
			{ tpl: 'Vocawiki版权所有', label: 'Vocawiki版权所有', fields: [], missing: true },
		],
	},
]

export const buildLicenseMenu = () =>
	LICENSES.map((g) => ({
		label: g.group,
		items: g.options.map((o) => ({
			value: o.tpl,
			label: o.label + (o.missing ? '（模板未创建）' : ''),
		})),
	}))
