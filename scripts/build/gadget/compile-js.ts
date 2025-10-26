import { rolldown } from 'rolldown'

import { noticeForEditors } from '../utils/notice'

export async function compileJS(inputPath: string): Promise<string> {
	const bundle = await rolldown({
		input: inputPath,
		tsconfig: 'src/tsconfig.json',
		transform: {
			target: ['edge79', 'chrome109'],
		},
		treeshake: true,
		platform: 'browser',
	})

	try {
		const { output } = await bundle.generate({ minify: true })
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
