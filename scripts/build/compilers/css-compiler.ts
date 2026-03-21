import assert from 'node:assert/strict'
import { join, relative, resolve } from 'node:path'

import tailwindcss from '@tailwindcss/postcss'
import {
	Features,
	transform,
	type Declaration,
	type MediaQuery,
	type Rule,
	type Selector,
	type SelectorComponent,
	type TransformOptions,
} from 'lightningcss'
import postcss, { AtRule, type Root, type Plugin } from 'postcss'
import { mapValues, traverse } from 'radashi'

import { IS_PRODUCTION } from '../../../lib/config' // 由于vite.config.ts也用到了css-compiler.ts，这里不能使用导入别名@/lib
import { CSS_BROWSER_TARGETS } from '../browser-target'

const postcssInstance = postcss(
	postcssInsertImportTailwindConfig('src/gadgets/site-styles/index.css'),
	tailwindcss({
		base: 'src',
		optimize: false,
	}) as Plugin,
)

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
		...lightningCSSOptions,
		filename: path,
		code: Buffer.from(css),
	})

	for (const warning of result.warnings) {
		console.warn('Lightning CSS warning:', warning)
	}

	return result.code.toString()
}

export const lightningCSSOptions: Omit<
	TransformOptions<{
		'tw-utilities': {
			prelude: null
			body: 'rule-list'
		}
	}>,
	'filename' | 'code'
> = {
	targets: mapValues(CSS_BROWSER_TARGETS, ([major, minor, patch]) => version(major, minor, patch)),
	exclude: Features.FontFamilySystemUi,
	minify: IS_PRODUCTION,
	sourceMap: false,
	// @tw-utilities 的处理逻辑：
	// @tw-utilities {
	//   .class-1 { color: #001; }
	//   .class-2 .class-3 { color: #002; }
	//   div.class-4 { color: #004; }
	//   .class-5 { .class-6 { color: #004; } }
	//   /* ... */
	// }
	// 转换为：
	// .class-1:not(#a#a#b) { color: #001; }
	// .class-2 .class-3:not(#a#a#b) { color: #002; }
	// div.class-4:not(#a#a#b) { color: #004; }
	// .class-5 { .class-6:not(#a#a#b) { color: #004; } }
	// /* ... */
	// 目的是增加选择器的优先级
	customAtRules: {
		'tw-utilities': {
			prelude: null, // 该 at-rule 没有前置参数 (如 @my-at-rule (xxx) 中的 xxx)
			body: 'rule-list', // 告诉解析器，大括号内是一组 CSS 规则
		},
	},
	visitor: {
		// Tailwind会在CSS文件中加入如
		// `/*! tailwindcss v4.2.2 | MIT License | https://tailwindcss.com */`
		// 的注释，更新Tailwind版本时会在站内产生大量无意义的编辑记录。
		// 此处删除注释中“tailwind v4.X.X”的小版本，防止该问题。
		StyleSheet: IS_PRODUCTION
			? (sheet) => {
					const comments = sheet.licenseComments
					if (comments.length === 0) return
					comments[0] = comments[0]!.replace(/(?<=tailwindcss v\d+)\.\d+\.\d+/, '')

					// https://github.com/parcel-bundler/lightningcss/issues/1081 TODO: 上游bug修复后移除
					traverse(sheet, (value, key, parent) => {
						if (value === null && typeof key === 'string') {
							delete parent[key as keyof typeof parent]
						}
					})

					return {
						licenseComments: comments,
						rules: sheet.rules,
						sourceMapUrls: sheet.sourceMapUrls,
						sources: sheet.sources,
					}
				}
			: undefined,
		Rule: {
			custom: {
				'tw-utilities': (rule) => {
					// rule.body.value 包含了 @my-at-rule 中解析出的所有子规则
					for (const ruleInBody of rule.body.value) {
						transformLeafSelector(ruleInBody)
					}

					// https://github.com/parcel-bundler/lightningcss/issues/1081 TODO: 上游bug修复后移除
					traverse(rule.body.value, (value, key, parent) => {
						if (value === null && typeof key === 'string') {
							delete parent[key as keyof typeof parent]
						}
					})

					// 把 @tw-utilities { ... } 脱壳，用其内部代码替换掉自身
					return rule.body.value
				},
			},
		},
	},
}

/** `:not(#a#a#b)`，用于增加选择器优先级 */
const theSelectorComponent: SelectorComponent = {
	type: 'pseudo-class',
	kind: 'not',
	selectors: [
		[
			{ type: 'id', name: 'a' },
			{ type: 'id', name: 'a' },
			{ type: 'id', name: 'b' },
		],
	],
}

/**
 * @returns 是否转换了选择器
 */
function transformLeafSelector(rule: Rule<Declaration, MediaQuery>): boolean {
	switch (rule.type) {
		case 'style': {
			const childRules = rule.value.rules
			if (childRules && childRules.length > 0) {
				const isEachChildRulesTransformed = childRules.map((rule) => transformLeafSelector(rule))
				assert(
					new Set(isEachChildRulesTransformed).size === 1,
					'暂不支持部分嵌套规则转换而另一部分不转换的情况',
				)
				const allChildRulesAreTransformed = isEachChildRulesTransformed[0]!
				if (allChildRulesAreTransformed) {
					const declarations = rule.value.declarations ?? {}
					if (declarations.declarations?.length || declarations.importantDeclarations?.length) {
						// 既有自身属性又有嵌套样式时，把
						// .parent {
						//   color: red;
						//   .child:not(#a#a#b) { ... }
						// }
						// 变成
						// .parent {
						//   &:not(#a#a#b) { color: red; }
						//   .child:not(#a#a#b) { ... }
						// }
						delete rule.value.declarations
						childRules.unshift({
							type: 'style',
							value: {
								loc: rule.value.loc,
								selectors: [[{ type: 'nesting' }, theSelectorComponent]],
								declarations,
							},
						})
					}
					// 嵌套的选择器已经转换，不再转换当前选择器
					return true
				}
				// 嵌套规则里面没有选择器，可能是@media之类的
			}
			// 转换选择器
			for (const selector of rule.value.selectors) {
				transformSelector(selector)
			}
			return true
		}

		case 'container':
		case 'starting-style':
		case 'supports':
		case 'media': {
			const childRules = rule.value.rules
			assert(childRules && childRules.length > 0, '必须存在嵌套规则')
			const isEachChildRulesTransformed = childRules.map((rule) => transformLeafSelector(rule))
			assert(
				new Set(isEachChildRulesTransformed).size === 1,
				'暂不支持部分嵌套规则转换而另一部分不转换的情况',
			)
			return isEachChildRulesTransformed[0]!
		}

		case 'counter-style':
		case 'custom-media':
		case 'font-face':
		case 'font-palette-values':
		case 'font-feature-values':
		case 'import':
		case 'keyframes':
		case 'layer-statement':
		case 'namespace':
		case 'nested-declarations':
		case 'property':
		case 'view-transition':
		case 'viewport':
			// 跳过
			return false

		default:
			throw new Error(`不支持的规则类型：${rule.type}。${JSON.stringify(rule)}`)
	}
}

function transformSelector(selector: Selector) {
	const lastComponentIndex = selector.findLastIndex((component) => {
		switch (component.type) {
			case 'universal':
			case 'type': // 指元素选择器
			case 'class':
			case 'pseudo-class':
			case 'attribute':
			case 'id':
			case 'nesting':
				return true
		}
		return false
	})
	assert(lastComponentIndex !== -1, 'selector中不存在可以插入:not()的component')
	// 在component之后插入 :not(#a#a#b)
	selector.splice(lastComponentIndex + 1, 0, theSelectorComponent)
}

function version(major: number, minor = 0, patch = 0) {
	return (major << 16) | (minor << 8) | patch
}

function postcssInsertImportTailwindConfig(referencePath: string): Plugin {
	return {
		postcssPlugin: 'postcss-ensure-reference-tailwind-theme',
		Once(root: Root) {
			const srcFilePath = root.source?.input.file
			assert(srcFilePath, '插件当前处理的文件未知路径')

			if (resolve(srcFilePath) === resolve(referencePath)) {
				return
			}

			// 检查是否已存在 @reference 规则
			const hasExistingImport = root.some((node) => {
				return node.type === 'atrule' && node.name === 'reference'
			})
			if (hasExistingImport) return

			const srcFileDir = join(srcFilePath, '..')
			const relativeImportPath = relative(srcFileDir, referencePath).replaceAll('\\', '/')

			const importRule = new AtRule({
				name: 'reference',
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
