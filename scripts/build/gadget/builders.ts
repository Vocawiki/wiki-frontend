import { compileJS, compileSCSS } from '../compilers'
import { noticeForEditors } from '../utils/notice'

export type GadgetBuilder = (ctx: { path: string }) => Promise<{ content: string }>

const buildJSOrTSGadget: GadgetBuilder = async ({ path }) => {
	// 显式判断文件是否存在，以免填错扩展名时 rolldown 自动处理导致输出的 inputPath 不正确
	if (!(await Bun.file(path).exists())) {
		throw new Error(`不存在文件：${path}`)
	}
	const code = await compileJS(path, { format: 'iife' })
	const content = `/**
 * ${noticeForEditors(path).join('\n * ')}
 */
/* <pre> */
"use strict";${code}
/* </pre> */`

	return { content }
}

export const gadgetBuilders: Record<string, GadgetBuilder> = {
	scss: async ({ path }) => {
		const code = await compileSCSS(path)
		const content = `/**
 * ${noticeForEditors(path).join('\n * ')}
 */
/* <pre> */
${code}
/* </pre> */`

		return { content }
	},

	js: buildJSOrTSGadget,
	ts: buildJSOrTSGadget,
}
