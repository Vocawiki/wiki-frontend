import { compileCSS } from '../compilers'
import { noticeForEditors } from '../utils/notice'

export type GadgetBuilder = (ctx: { path: string }) => Promise<{ content: string }>

export async function buildCss({ path }: { path: string }) {
	const css = await compileCSS(path)
	const content = `/**
 * ${noticeForEditors(path).join('\n * ')}
 */
/* <nowiki> */
${css}
/* </nowiki> */`
	return { content }
}
