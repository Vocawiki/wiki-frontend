import eslint from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// import css from '@eslint/css'
// import json from '@eslint/json'
// import markdown from '@eslint/markdown'
// import pluginReact from 'eslint-plugin-react'

export default defineConfig(
	eslint.configs.recommended,
	tseslint.configs.recommendedTypeChecked,
	tseslint.configs.stylisticTypeChecked,
	{
		rules: {
			'@typescript-eslint/consistent-type-imports': 'error',
			'@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/prefer-nullish-coalescing': [
				'error',
				{
					ignorePrimitives: {
						boolean: true,
						string: true,
					},
				},
			],
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/prefer-regexp-exec': 'off',
			'@typescript-eslint/consistent-indexed-object-style': 'off',
		},
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		files: [
			'*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'!(src)/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'src/**/(meta).ts',
		],
		languageOptions: {
			globals: globals.node,
		},
	},
	{
		files: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		ignores: ['src/**/(meta).ts'],
		languageOptions: {
			globals: globals.browser,
		},
	},
	// pluginReact.configs.flat.recommended,
	// { files: ['**/*.json'], plugins: { json }, language: 'json/json', extends: ['json/recommended'] },
	// { files: ['**/*.jsonc'], plugins: { json }, language: 'json/jsonc', extends: ['json/recommended'] },
	// { files: ['**/*.json5'], plugins: { json }, language: 'json/json5', extends: ['json/recommended'] },
	// { files: ['**/*.md'], plugins: { markdown }, language: 'markdown/gfm', extends: ['markdown/recommended'] },
	// { files: ['**/*.css'], plugins: { css }, language: 'css/css', extends: ['css/recommended'] },
	globalIgnores(['node_modules/', 'out/']),
)
