import { defineConfig, type DummyRuleMap } from 'oxlint'
import type { OmitIndexSignature } from 'type-fest'

type KnownRuleMap = OmitIndexSignature<DummyRuleMap>

const ERROR = 'error' as const
const OFF = 'off' as const

const projectSpecificRules = {
	'import/no-unassigned-import': [ERROR, { allow: ['**/*.css', '@/lib/server-only'] }],
	'jsx-a11y/anchor-has-content': [ERROR, { components: ['ExternalLink'] }],
	'jsx-a11y/alt-text': [ERROR, { img: ['WikiImage', 'WikiImageServerOnly'] }],
	'node/no-process-env': OFF,
} as const satisfies KnownRuleMap

export default defineConfig({
	plugins: [
		'eslint',
		'import',
		'jsx-a11y',
		'node',
		'oxc',
		'promise',
		'react',
		'typescript',
		'unicorn',
	],
	// categories: https://oxc.rs/docs/guide/usage/linter/config.html#enable-groups-of-rules-with-categories
	categories: {
		correctness: ERROR, // 明显错误或无用的代码
		suspicious: ERROR, // 可能错误或无用的代码
		pedantic: ERROR, // 过于严格的规则，可能会出现误报
		perf: ERROR, // 旨在提高运行时性能的规则
		style: OFF,
		restriction: ERROR, // 禁止特定模式或特征的规则
		nursery: ERROR, // 规则正在制定中，可能会有所变更。
	},
	options: {
		typeAware: true,
		reportUnusedDisableDirectives: ERROR,
		typeCheck: true,
	},
	env: {
		builtin: true,
	},
	settings: {
		react: {
			version: '19.3',
		},
	},
	ignorePatterns: ['node_modules/', 'out/'],
	rules: {
		// deprecated
		'typescript/ban-types': OFF,
		'typescript/no-empty-interface': OFF,
		'typescript/no-var-requires': OFF,
		'typescript/prefer-ts-expect-error': OFF,

		// 对TypeScript无用：
		'constructor-super': OFF,
		'getter-return': OFF,
		'no-class-assign': OFF,
		'no-const-assign': OFF,
		'no-dupe-class-members': OFF,
		'no-dupe-keys': OFF,
		'no-func-assign': OFF,
		'no-new-native-nonconstructor': OFF,
		'no-obj-calls': OFF,
		'no-setter-return': OFF,
		'no-unsafe-negation': OFF,
		'no-undef': OFF,
		'import/default': OFF,
		'import/named': OFF,
		'import/namespace': OFF,
		'import/no-named-as-default-member': OFF,
		'import/no-webpack-loader-syntax': OFF,
		'import/unambiguous': OFF,
		'node/no-new-require': OFF,
		'promise/valid-params': OFF,
		'promise/no-new-statics': OFF,
		'promise/spec-only': OFF,

		// 对ESM无用
		'node/no-top-level-await': OFF,

		// 由unicorn/prefer-module处理
		'import/no-amd': OFF,
		'import/no-commonjs': OFF,
		'import/no-dynamic-require': OFF,
		'node/no-exports-assign': OFF,

		// 对React函数组件无用
		'react/no-set-state': OFF,
		'react/prefer-es6-class': OFF,
		'react/state-in-constructor': OFF,

		// 对React Compiler无用
		'react/no-object-type-as-default-prop': OFF,

		// correctness
		'no-useless-escape': [
			ERROR,
			{
				allowRegexCharacters: ['-', '['],
			},
		],
		'no-unused-vars': [
			ERROR,
			{
				args: 'all',
				argsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			},
		],
		'jsx-a11y/no-redundant-roles': [ERROR, { ul: ['list'], ol: ['list'], li: ['listitem'] }],

		// suspicious
		'no-underscore-dangle': [ERROR, { allowAfterThis: true }],
		// 虽然typescript/no-import-type-side-effects能为`import {} from 'xx'`报错，但`import Default, {} from 'xx'`不报错
		'import/no-empty-named-blocks': ERROR,
		'promise/always-return': [ERROR, { ignoreLastCallback: true }],

		'no-shadow': OFF,
		'import/no-self-import': OFF, // 由import/no-cycle处理
		'react/react-in-jsx-scope': OFF,
		'typescript/consistent-return': OFF, // 由TypeScript `noImplicitReturns`代替
		'typescript/no-unnecessary-type-arguments': OFF,
		'typescript/no-unsafe-enum-assignment': OFF, // tsconfig已禁止使用enum；此规则过于耗时
		'typescript/no-unsafe-type-assertion': OFF,
		'unicorn/no-array-reverse': OFF, // 浏览器兼容性
		'unicorn/no-array-sort': OFF, // 浏览器兼容性
		// import type {} from 'module' 是有用的。其余情况被 typescript/no-import-type-side-effects 涵盖了
		'unicorn/require-module-specifiers': OFF,

		// pedantic
		eqeqeq: [ERROR, 'always', { null: 'ignore' }],
		'max-lines': [ERROR, { max: 600 }],
		'max-lines-per-function': ['warn', { max: 100 }],
		'typescript/prefer-nullish-coalescing': [
			ERROR,
			{ ignorePrimitives: { boolean: true, string: true } },
		],
		'typescript/switch-exhaustiveness-check': [ERROR, { considerDefaultExhaustiveForUnions: true }],

		'array-callback-return': OFF, // 用TypeScript类型检查来弥补
		'max-classes-per-file': OFF,
		'no-inline-comments': OFF,
		'no-promise-executor-return': OFF,
		'no-warning-comments': OFF,
		'sort-vars': OFF,
		'typescript/no-confusing-void-expression': OFF,
		'typescript/prefer-readonly-parameter-types': OFF,
		'typescript/strict-boolean-expressions': OFF,
		'typescript/strict-void-return': OFF,
		'unicorn/consistent-assert': OFF,
		'unicorn/no-array-callback-reference': OFF,
		'unicorn/prefer-number-coercion': OFF,
		'unicorn/prefer-query-selector': OFF,
		'unicorn/prefer-top-level-await': OFF,

		// perf
		'oxc/no-map-spread': OFF, // 安全性比性能更重要

		// restriction
		complexity: [ERROR, { variant: 'modified' }],
		'no-use-before-define': [ERROR, { classes: false, functions: false }],
		'typescript/explicit-member-accessibility': [ERROR, { accessibility: 'no-public' }],
		'import/extensions': [
			ERROR,
			'never',
			{ checkTypeImports: true, pattern: { css: 'always', json: 'always' } },
		],
		'react/jsx-filename-extension': [ERROR, { allow: 'as-needed', extensions: ['jsx', 'tsx'] }],
		'react/only-export-components': [ERROR, { allowExportNames: ['getStaticProps'] }],

		'default-case': OFF, // 由typescript/switch-exhaustiveness-check处理
		'no-bitwise': OFF,
		'no-console': OFF,
		'no-eq-null': OFF,
		'no-implicit-globals': OFF,
		'no-param-reassign': OFF,
		'no-plusplus': OFF,
		'no-undefined': OFF,
		'no-void': OFF,
		'import/no-default-export': OFF,
		'import/no-relative-parent-imports': OFF,
		'import/max-dependencies': OFF,
		'node/no-path-concat': OFF, // unicorn/prefer-module已禁止`__dirname`、`__filename`
		'oxc/no-async-await': OFF,
		'oxc/no-optional-chaining': OFF,
		'oxc/no-rest-spread-properties': OFF,
		'promise/catch-or-return': OFF,
		'react/forbid-component-props': OFF,
		'react/no-multi-comp': OFF,
		'react/jsx-no-literals': OFF,
		'react/no-danger': OFF,
		'react/todo': OFF, // 仅当您需要查看编译器跳过了哪些代码时才启用此规则；上游默认将其关闭。
		'typescript/explicit-function-return-type': OFF,
		'typescript/explicit-module-boundary-types': OFF,
		'typescript/no-explicit-any': OFF,
		'typescript/no-non-null-assertion': OFF,
		'typescript/no-require-imports': OFF, // 由unicorn/prefer-module处理
		'typescript/promise-function-async': OFF,
		'unicorn/no-array-for-each': OFF,

		// style
		'default-case-last': ERROR,
		'func-name-matching': ERROR,
		'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
		'grouped-accessor-pairs': ERROR,
		'guard-for-in': ERROR,
		'id-denylist': ERROR,
		'id-match': ERROR,
		'logical-assignment-operators': ERROR,
		'max-statements': ['warn', { max: 50 }],
		'new-cap': ERROR,
		'no-duplicate-imports': ERROR,
		'no-extra-label': ERROR,
		'no-implicit-coercion': [ERROR, { disallowTemplateShorthand: true }],
		'no-label-var': ERROR,
		'no-labels': ERROR,
		'no-lone-blocks': ERROR,
		'no-multi-assign': ERROR,
		'no-multi-str': ERROR,
		'no-new-func': ERROR,
		'no-return-assign': ERROR,
		'no-script-url': ERROR,
		'no-template-curly-in-string': ERROR,
		'no-useless-computed-key': ERROR,
		'object-shorthand': ERROR,
		'operator-assignment': ERROR,
		'prefer-arrow-callback': ERROR,
		'prefer-const': ERROR,
		'prefer-destructuring': [ERROR, { array: true, object: false }],
		'prefer-exponentiation-operator': ERROR,
		'prefer-numeric-literals': ERROR,
		'prefer-object-has-own': ERROR,
		'prefer-object-spread': ERROR,
		'prefer-regex-literals': ERROR,
		'prefer-rest-params': ERROR,
		'prefer-spread': ERROR,
		'prefer-template': ERROR,
		'vars-on-top': ERROR,
		yoda: ERROR,
		'import/first': ERROR,
		'node/no-sync': ERROR,
		'promise/no-return-wrap': ERROR,
		'promise/param-names': [
			ERROR,
			{ resolvePattern: '^_?resolve(?:$|[A-Z0-9])', rejectPattern: '^_?reject(?:$|[A-Z0-9])' },
		],
		'react/function-component-definition': ERROR,
		'react/hook-use-state': ERROR,
		'react/jsx-boolean-value': ERROR,
		'react/jsx-curly-brace-presence': ERROR,
		'react/jsx-fragments': ERROR,
		'react/jsx-handler-names': ERROR,
		'react/jsx-pascal-case': ERROR,
		'react/no-redundant-should-component-update': ERROR,
		'react/self-closing-comp': ERROR,
		'typescript/adjacent-overload-signatures': ERROR,
		'typescript/array-type': ERROR,
		'typescript/ban-tslint-comment': ERROR,
		'typescript/class-literal-property-style': ERROR,
		'typescript/consistent-generic-constructors': ERROR,
		'typescript/consistent-type-assertions': ERROR,
		'typescript/consistent-type-definitions': ERROR,
		'typescript/consistent-type-exports': ERROR,
		'typescript/consistent-type-imports': ERROR,
		'typescript/dot-notation': ERROR,
		'typescript/method-signature-style': ERROR,
		'typescript/no-inferrable-types': [ERROR, { ignoreParameters: true }],
		'typescript/no-unnecessary-qualifier': ERROR,
		'typescript/prefer-find': ERROR,
		'typescript/prefer-for-of': ERROR,
		'typescript/prefer-function-type': ERROR,
		'typescript/prefer-readonly': ERROR,
		'typescript/prefer-reduce-type-parameter': ERROR,
		'typescript/prefer-return-this-type': ERROR,
		'typescript/prefer-string-starts-ends-with': ERROR,
		'typescript/unified-signatures': ERROR,
		'unicorn/catch-error-name': ERROR,
		'unicorn/consistent-date-clone': ERROR,
		'unicorn/consistent-existence-index-check': ERROR,
		'unicorn/consistent-template-literal-escape': ERROR,
		'unicorn/custom-error-definition': ERROR,
		'unicorn/error-message': ERROR,
		'unicorn/explicit-timer-delay': ERROR,
		'unicorn/filename-case': [
			ERROR,
			{
				case: 'kebabCase',
				ignore: ['^heimu-toggle-defaultOn\\.'], // 历史遗留
			},
		],
		'unicorn/max-nested-calls': ERROR,
		'unicorn/no-array-method-this-argument': ERROR,
		'unicorn/no-console-spaces': ERROR,
		'unicorn/no-unreadable-array-destructuring': ERROR,
		'unicorn/no-useless-collection-argument': ERROR,
		'unicorn/no-zero-fractions': ERROR,
		'unicorn/numeric-separators-style': [
			ERROR,
			{ hexadecimal: { groupLength: 4, minimumDigits: 8 } },
		],
		'unicorn/prefer-array-index-of': ERROR,
		'unicorn/prefer-bigint-literals': ERROR,
		'unicorn/prefer-class-fields': ERROR,
		'unicorn/prefer-classlist-toggle': ERROR,
		'unicorn/prefer-default-parameters': ERROR,
		'unicorn/prefer-dom-node-text-content': ERROR,
		'unicorn/prefer-export-from': ERROR,
		'unicorn/prefer-includes': ERROR,
		'unicorn/prefer-keyboard-event-key': ERROR,
		'unicorn/prefer-logical-operator-over-ternary': ERROR,
		'unicorn/prefer-modern-dom-apis': ERROR,
		'unicorn/prefer-negative-index': ERROR,
		'unicorn/prefer-object-from-entries': ERROR,
		'unicorn/prefer-reflect-apply': ERROR,
		'unicorn/prefer-response-static-json': ERROR,
		'unicorn/prefer-spread': ERROR,
		'unicorn/prefer-string-trim-start-end': ERROR,
		'unicorn/prefer-structured-clone': ERROR,
		'unicorn/prefer-ternary': [ERROR, 'only-single-line'],
		'unicorn/relative-url-style': ERROR,
		'unicorn/require-array-join-separator': ERROR,
		'unicorn/require-module-attributes': ERROR,
		'unicorn/switch-case-break-position': ERROR,
		'unicorn/text-encoding-identifier-case': [ERROR, { withDash: true }],

		'typescript/parameter-properties': OFF, // tsconfig已设置erasableSyntaxOnly
		'unicorn/empty-brace-spaces': OFF, // 由formatter完成
		'unicorn/no-await-expression-member': OFF, // 并不一定影响阅读
		'unicorn/no-nested-ternary': OFF, // 虽然这个规则支持“one level deep”，但是它要求必须加括号，与Oxfmt冲突
		'unicorn/no-null': OFF, // 过于严格
		'unicorn/number-literal-case': OFF, // 与Oxfmt冲突，希望日后Oxfmt支持配置数字大小写
		// 本项目大多代码是**仅且仅能**在浏览器执行的代码，在浏览器之外的环境执行没有意义，用window语义更直白
		'unicorn/prefer-global-this': OFF,
		'unicorn/prefer-optional-catch-binding': OFF, // 由no-unused-vars处理
		'unicorn/prefer-string-raw': OFF, // 哪怕只有一个反斜杠也报，干扰阅读
		'unicorn/switch-case-braces': OFF, // TODO: 等single-statement选项实现后再开启
		'unicorn/throw-new-error': OFF, // 由new-cap处理

		...projectSpecificRules,
	} satisfies KnownRuleMap,
	overrides: [
		{
			files: [
				'*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
				'!(src)/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
				'src/**/(meta).ts',
			],
			env: {
				browser: true,
				node: true,
			},
		},
		{
			files: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
			env: {
				browser: true,
			},
		},
	],
})
