import assert from 'node:assert/strict'
import { join, relative } from 'node:path'

import tailwindcss from '@tailwindcss/postcss'
import { Features, transform } from 'lightningcss'
import postcss, { AtRule, type Root, type Plugin } from 'postcss'

import { IS_PRODUCTION } from '@/tools/utils'

export async function compileCSS(path: string): Promise<string> {
	let css = await Bun.file(path).text()

	css = (
		await postcssInstance.process(css, {
			from: path,
			to: undefined,
		})
	).css

	css = cleanTailwindPlaceholders(css)

	const result = transform({
		filename: path,
		code: Buffer.from(css),
		targets: {
			chrome: version(109),
			safari: version(16, 3), // 虽然明面上是16.4，但是仁慈点。16.3与Chrome 109发布时间差不多
			firefox: version(109), // 虽然明面上是115，但同上
		},
		exclude: Features.FontFamilySystemUi,
		minify: IS_PRODUCTION,
		sourceMap: false,
	})

	for (const warning of result.warnings) {
		console.warn('Lightning CSS warning:', warning)
	}

	return result.code.toString()
}

function version(major: number, minor = 0, patch = 0) {
	return (major << 16) | (minor << 8) | patch
}

const postcssInstance = postcss(
	postcssInsertImportTailwindConfig('src/tailwind-config.css'),
	tailwindcss({
		base: 'src',
		// optimize: IS_PRODUCTION ? { minify: false } : false,
		optimize: false,
	}) as Plugin,
)

function postcssInsertImportTailwindConfig(importPath: string): Plugin {
	const configFileName = 'tailwind-config.css'
	assert(importPath.endsWith(configFileName), `importPath必须是包含"${configFileName}"`)

	return {
		postcssPlugin: 'postcss-insert-import-tailwind-config',
		Once(root: Root) {
			// 检查是否已存在 @import config 规则
			const hasExistingImport = root.some((node) => {
				return (
					node.type === 'atrule' && node.name === 'import' && node.params.includes(configFileName)
				)
			})
			if (hasExistingImport) return

			const srcFilePath = root.source?.input.file
			assert(srcFilePath, '插件当前处理的文件未知路径')
			const srcFileDir = join(srcFilePath, '..')
			const relativeImportPath = relative(srcFileDir, importPath).replaceAll('\\', '/')

			const importRule = new AtRule({
				name: 'import',
				params: `"${relativeImportPath}"`,
			})

			const firstNode = root.first
			// 如果第一个节点是 @charset，则插入到它之后，否则插入到最前面
			if (firstNode?.type === 'atrule' && firstNode.name === 'charset') {
				firstNode.after(importRule)
			} else {
				root.prepend(importRule)
			}
		},
	}
}

function cleanTailwindPlaceholders(css: string): string {
	return css.replaceAll(/(?<=;|\{)\s*--[a-z-]+:\s*var\(--skin-specific\);?/gm, '') // 移除“--xxx: var(--skin-specific)”
	// .replaceAll(/(?<=\*\/\n):root,\s*:host\s*\{\s*\}\s*/gm, '') // 移除空的 “:root, :host {}”
}
