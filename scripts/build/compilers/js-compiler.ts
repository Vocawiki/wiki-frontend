import assert from 'node:assert/strict'

import PQueue from 'p-queue'
import {
	rolldown,
	type InputOptions as RolldownInputOptions,
	type InputOption as RolldownInputOption,
	type OutputOptions as RolldownOutputOptions,
	type AddonFunction,
} from 'rolldown'
import { objectEntries } from 'ts-extras'

import { IS_PRODUCTION } from '@/lib/config'
import {
	ASSETS_BASE_URL,
	ASSETS_DIR_IN_OUTPUT_DIR,
	OUTPUT_DIR,
	PAGES_DIR_IN_OUTPUT_DIR,
} from '@/scripts/config'

import { JS_BROWSER_TARGETS } from '../browser-target'

const rolldownPredefinedOptions: RolldownInputOptions = {
	experimental: {
		// chunkImportMap: true,
		nativeMagicString: true,
	},
	transform: {
		target: objectEntries(JS_BROWSER_TARGETS)
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
	await using bundle = await rolldown({ ...rolldownPredefinedOptions, input })

	const outputOptions: RolldownOutputOptions = { minify: IS_PRODUCTION, ...options }
	const { output } = await bundle.generate(outputOptions)
	assert.equal(output.length, 1, '应当只有一个chunk生成')
	const code = output[0].code
	return code
}

export interface EntryMeta {
	path: string
	format: 'es' | 'iife'
	postBanner?: string | AddonFunction
	postFooter?: string | AddonFunction
	sourceMap: boolean
}

/** 从Rolldown entry name到meta */
export type EntriesAdditionalInfo = Map<string, EntryMeta>

export async function buildJsEntries(
	input: RolldownInputOption,
	{
		entriesAdditionalInfo,
		postBuildHandlers,
	}: {
		entriesAdditionalInfo: EntriesAdditionalInfo
		postBuildHandlers: Map<string, (entryUrl: string) => Promise<void>>
	},
): Promise<void> {
	const calledPostBuildHandlers = new Set<string>()
	const postBuildQueue = new PQueue()

	await using bundle = await rolldown({
		...rolldownPredefinedOptions,
		plugins: [
			{
				name: 'mw-pages-should-not-be-imported',
				renderChunk(_, chunk) {
					const imports = new Set([...chunk.imports, ...chunk.dynamicImports])
					if (imports.size === 0) return
					imports.values().forEach((fileName) => {
						// failName形如：'assets/radashi-!~{002}~.js'
						if (fileName.startsWith(`${PAGES_DIR_IN_OUTPUT_DIR}/`)) {
							throw new Error(`chunk ${chunk.name}导入了MW页面：${fileName}`)
						}
					})
				},
			},
			{
				name: 'handle-entries',
				renderChunk(code, chunk) {
					if (!chunk.isEntry) return

					const entryInfo = entriesAdditionalInfo.get(chunk.name)
					if (!entryInfo) return

					if (entryInfo.format !== 'iife') {
						if (chunk.name.startsWith(`${PAGES_DIR_IN_OUTPUT_DIR}/`)) {
							if (chunk.imports.length > 0) {
								throw new Error(
									`内联脚本${chunk.name}包含静态导入（将会导致路径错误）：\n${chunk.imports.join('\n')}`,
								)
							}
							if (chunk.exports.length > 0) {
								throw new Error(
									`内联脚本${chunk.name}包含静态导出（可能是误写）：\n${chunk.exports.join('\n')}`,
								)
							}
						}
						return
					}

					if (/^await[\s(]]/m.test(code)) {
						throw new Error(`IIFE入口${chunk.name}包含顶层await`)
					}
					if (chunk.imports.length > 0) {
						throw new Error(`IIFE入口${chunk.name}包含静态导入：\n${chunk.imports.join('\n')}`)
					}
					if (chunk.exports.length > 0) {
						throw new Error(`IIFE入口${chunk.name}包含静态导出：\n${chunk.exports.join('\n')}`)
					}
					if (/^export[\s{]/m.test(code)) {
						throw new Error(`IIFE入口${chunk.name}包含静态导出语句`)
					}
				},
			},
			{
				name: 'post-build',
				writeBundle(_, bundle) {
					Object.values(bundle).forEach((chunk) => {
						if (chunk.type === 'asset') return
						const name = chunk.name
						const handler = postBuildHandlers.get(name)
						if (!handler) return
						void postBuildQueue.add(async () => {
							await handler(
								`${ASSETS_BASE_URL}/${chunk.fileName.slice(ASSETS_DIR_IN_OUTPUT_DIR.length + 1)}`,
							)
							calledPostBuildHandlers.add(name)
						})
					})
				},
			},
		],
		input,
	})
	const outputOptions: RolldownOutputOptions = {
		minify: IS_PRODUCTION,
		dir: OUTPUT_DIR,
		generatedCode: { preset: 'es2015' },
		entryFileNames: ({ name }) => {
			if (name.startsWith(`${PAGES_DIR_IN_OUTPUT_DIR}/`)) {
				return name
			}
			return `${ASSETS_DIR_IN_OUTPUT_DIR}/[name]-[hash].js`
		},
		chunkFileNames: `${ASSETS_DIR_IN_OUTPUT_DIR}/[name]-[hash].js`,
		// 发生名称过滤时输出一条警告
		sanitizeFileName: (name) => {
			// 遵循默认行为：https://github.com/rolldown/rolldown/blob/bba03da85ecbf2a4d954b95ddce80a4c6dd88a7d/crates/rolldown_utils/src/sanitize_filename.rs
			// eslint-disable-next-line no-control-regex
			const sanitized = name.replace(/[\0-\x1f"#$%&*+,:;<=>?\[\]^`{|}\x7f]/g, '_')
			if (sanitized !== name) {
				console.warn(`名称被转换：“${name}” → “${sanitized}”`)
			}
			return sanitized
		},
		codeSplitting: {
			groups: [
				{
					name: 'react',
					test: /node_modules[/\\]react/,
					priority: 20,
				},
				{
					name: 'lib',
					test: /node_modules/,
					priority: 10,
				},
				{
					name: 'common',
					minShareCount: 2,
					minSize: 10000,
					priority: 5,
				},
			],
		},
		async postBanner(chunk) {
			const meta = entriesAdditionalInfo.get(chunk.name)
			if (!meta) return ''
			const template = meta.format === 'iife' ? '"use strict";\n(function(){' : ''
			const postBanner = meta.postBanner
			if (!postBanner) return template
			return (typeof postBanner === 'string' ? postBanner : await postBanner(chunk)) + template
		},
		async postFooter(chunk) {
			const meta = entriesAdditionalInfo.get(chunk.name)
			if (!meta) return ''
			const template = meta.format === 'iife' ? '})();' : ''
			const postFooter = meta.postFooter
			if (!postFooter) return template
			return template + (typeof postFooter === 'string' ? postFooter : await postFooter(chunk))
		},
		sourcemap: true,
		sourcemapPathTransform(relativeSourcePath: string) {
			return relativeSourcePath.replace(/^(?:\.\.[/\\]){2}/, '')
		},
	}

	await bundle.write(outputOptions)

	await Promise.race([postBuildQueue.onError(), postBuildQueue.onIdle()])
	postBuildQueue.pause() // Stop processing remaining tasks
	postBuildQueue.on('add', () => {
		throw new Error('不应有新的任务追加')
	})
	assert.equal(calledPostBuildHandlers.size, postBuildHandlers.size, '有postBuildHandler未执行')
}
