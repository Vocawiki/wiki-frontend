import assert from 'node:assert/strict'

import {
	rolldown,
	type InputOptions as RolldownInputOptions,
	type InputOption as RolldownInputOption,
	type OutputOptions as RolldownOutputOptions,
	type RolldownBuild,
} from 'rolldown'

import { JS_BROWSER_TARGETS, type BrowserTargetVersion, type BrowserType } from '../browser-target'

const rolldownOptions: RolldownInputOptions = {
	transform: {
		target: (Object.entries(JS_BROWSER_TARGETS) as [BrowserType, BrowserTargetVersion][])
			.map(([browser, version]) => (version ? `${browser}${version.join('.')}` : undefined))
			.filter((x) => x !== undefined),
	},
	treeshake: {
		// import { ... } from 'radashi' 会导致Array.isArray、Number.isInteger被保留
		propertyReadSideEffects: false,
	},
	platform: 'browser',
}

export async function compileJS(
	input: RolldownInputOption,
	options: RolldownOutputOptions = {},
): Promise<string> {
	let bundle: RolldownBuild | undefined
	try {
		bundle = await rolldown({ ...rolldownOptions, input })

		const outputOptions: RolldownOutputOptions = { minify: true, ...options }
		const { output } = await bundle.generate(outputOptions)
		assert.equal(output.length, 1, '应当只有一个chunk生成')
		const code = output[0].code
		return code
	} finally {
		await bundle?.close()
	}
}
