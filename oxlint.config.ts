import { defineConfig, type DummyRuleMap } from 'oxlint'
import type { OmitIndexSignature } from 'type-fest'

type KnowRuleMap = OmitIndexSignature<DummyRuleMap>

const ERROR = 'error' as const
const OFF = 'off' as const

export default defineConfig({
	plugins: ['typescript', 'react'],
	// categories: https://oxc.rs/docs/guide/usage/linter/config.html#enable-groups-of-rules-with-categories
	categories: {
		correctness: ERROR,
		suspicious: ERROR,
		pedantic: ERROR,
		perf: ERROR,
		style: ERROR,
		restriction: ERROR,
		nursery: ERROR,
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

		// 对React函数组件无用
		'react/no-set-state': OFF,
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

		// suspicious
		'no-shadow': OFF,
		'typescript/consistent-return': OFF, // 由TypeScript `noImplicitReturns`代替
		'typescript/no-unnecessary-type-arguments': OFF,
		'typescript/no-unsafe-type-assertion': OFF,
		'react/react-in-jsx-scope': OFF,

		// pedantic
		eqeqeq: [ERROR, 'always', { null: 'ignore' }],
		'max-lines': [ERROR, { max: 600 }],
		'max-lines-per-function': ['warn', { max: 100 }],
		'typescript/prefer-nullish-coalescing': [
			ERROR,
			{
				ignorePrimitives: {
					boolean: true,
					string: true,
				},
			},
		],
		'typescript/switch-exhaustiveness-check': [ERROR, { considerDefaultExhaustiveForUnions: true }],
		'array-callback-return': OFF, // 用TypeScript类型检查来弥补
		'no-inline-comments': OFF,
		'no-promise-executor-return': OFF,
		'no-warning-comments': OFF,
		'sort-vars': OFF,
		'typescript/no-confusing-void-expression': OFF,
		'typescript/prefer-readonly-parameter-types': OFF,
		'typescript/strict-boolean-expressions': OFF,
		'typescript/strict-void-return': OFF,

		// perf

		// restriction
		complexity: [ERROR, { variant: 'modified' }],
		'no-use-before-define': [ERROR, { classes: false, functions: false }],
		'typescript/explicit-member-accessibility': [ERROR, { accessibility: 'no-public' }],
		'react/jsx-filename-extension': [ERROR, { allow: 'as-needed', extensions: ['jsx', 'tsx'] }],
		'default-case': OFF, // 由typescript/switch-exhaustiveness-check处理
		'no-bitwise': OFF,
		'no-console': OFF,
		'no-eq-null': OFF,
		'no-implicit-globals': OFF,
		'no-param-reassign': OFF,
		'no-plusplus': OFF,
		'no-undefined': OFF,
		'typescript/explicit-function-return-type': OFF,
		'typescript/explicit-module-boundary-types': OFF,
		'typescript/no-explicit-any': OFF,
		'typescript/no-non-null-assertion': OFF,
		'typescript/promise-function-async': OFF,
		'react/forbid-component-props': OFF,
		'react/no-multi-comp': OFF,
		'react/jsx-no-literals': OFF,
		'react/no-danger': OFF,
		'react/todo': OFF, // 仅当您需要查看编译器跳过了哪些代码时才启用此规则；上游默认将其关闭。

		// style
		'prefer-const': ERROR,
		'prefer-destructuring': [ERROR, { array: true, object: false }],
		'prefer-rest-params': ERROR,
		'prefer-spread': ERROR,
		'typescript/no-inferrable-types': [
			ERROR,
			{
				ignoreParameters: true,
			},
		],
		'max-statements': ['warn', { max: 50 }],
		'func-style': ['warn', 'declaration', { allowArrowFunctions: true }],
		'arrow-body-style': OFF,
		'capitalized-comments': OFF,
		curly: OFF,
		'default-param-last': OFF,
		'func-names': OFF,
		'id-length': OFF,
		'init-declarations': OFF,
		'max-params': OFF,
		'no-continue': OFF,
		'no-magic-numbers': OFF,
		'no-nested-ternary': OFF,
		'no-ternary': OFF,
		'one-var': OFF,
		'prefer-named-capture-group': OFF,
		'sort-imports': OFF,
		'sort-keys': OFF,
		'no-void': OFF,
		'typescript/prefer-regexp-exec': OFF,
		'typescript/consistent-indexed-object-style': OFF,
		'react/jsx-max-depth': OFF,
		'react/jsx-props-no-spreading': OFF,
	} satisfies KnowRuleMap,
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
