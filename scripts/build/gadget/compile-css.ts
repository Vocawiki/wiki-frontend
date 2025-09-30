import * as sass from 'sass-embedded'

import { noticeForEditors } from '../utils/notice'

export async function compileSCSS(path: string) {
	const result = await sass.compileAsync(path, { charset: false })
	return `/**
 * ${noticeForEditors(path).join('\n * ')}
 */
/* <pre> */

${result.css}

/* </pre> */`
}
