import fs from 'fs'

import { rolldown } from 'rolldown'

import { noticeForEditors } from '../utils/notice'

export async function compileJS(inputPath: string): Promise<string> {
	// 显式判断文件是否存在，以免填错扩展名时 rolldown 自动处理导致输出的 inputPath 不正确
	if (!fs.existsSync(inputPath)) {
		throw new Error(`File not found: ${inputPath}`)
	}

	const bundle = await rolldown({
		input: inputPath,
		transform: {
			target: ['edge79', 'chrome109'],
		},
		treeshake: true,
		platform: 'browser',
	})

	try {
		const { output } = await bundle.generate({
			minify: true,
			format: 'iife',
		})
		if (output.length !== 1) {
			throw new Error(`Expected exactly one chunk, got ${output.length}`)
		}
		const code = output[0].code

		return `/**
 * ${noticeForEditors(inputPath).join('\n * ')}
 */
/* <pre> */

${code}

/* </pre> */`
	} finally {
		await bundle.close()
	}
}
