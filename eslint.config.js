import { join } from 'node:path'

import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

// import css from '@eslint/css'
// import json from '@eslint/json'
// import markdown from '@eslint/markdown'
// import pluginReact from 'eslint-plugin-react'

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		plugins: { js },
		extends: ['js/recommended', tseslint.configs.recommendedTypeChecked, tseslint.configs.stylisticTypeChecked],
		rules: {
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-argument': 'off',
			'@typescript-eslint/prefer-regexp-exec': 'off',
			'@typescript-eslint/consistent-indexed-object-style': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': [
				'error',
				{
					ignorePrimitives: {
						boolean: true,
						string: true,
					},
				},
			],
			'@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true }],
			'@typescript-eslint/no-import-type-side-effects': 'error',
			'@typescript-eslint/consistent-type-imports': 'error',
		},
	},
	{
		files: [
			'*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'!(src)/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
			'src/gadgets/**/(meta).ts',
		],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
			globals: globals.node,
		},
	},
	{
		files: ['src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
		ignores: ['src/gadgets/**/(meta).ts'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: join(import.meta.dirname, 'src'),
			},
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
])
