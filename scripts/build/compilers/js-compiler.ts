import assert from 'node:assert/strict'

import { rolldown, type InputOption, type OutputOptions, type RolldownBuild } from 'rolldown'

export async function compileJS(input: InputOption, options: OutputOptions = {}): Promise<string> {
	let bundle: RolldownBuild | undefined
	try {
		bundle = await rolldown({
			input,
			transform: {
				target: [
					'edge79', // Edge迁移到Chromium后的第一个的版本，唉，还是对这些不更新浏览器的人太仁慈了。TODO: 时机成熟后移除
					'chrome109', // 最后一个支持Windows 7的Chrome版本
					'firefox115', // 最后一个支持Windows 7的Firefox版本
					'safari16.4',
				],
			},
			treeshake: true,
			platform: 'browser',
		})

		const outputOptions: OutputOptions = { minify: true, ...options }
		const { output } = await bundle.generate(outputOptions)
		assert.equal(output.length, 1, '应当只有一个chunk生成')
		const code = output[0].code
		return code
	} finally {
		await bundle?.close()
	}
}
