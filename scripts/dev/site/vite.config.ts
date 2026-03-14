import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [rsc(), react(), tailwindcss()],
	resolve: {
		tsconfigPaths: true,
	},
	define: {
		// 目前Vite仅用于开发，若用于构建，一定要谨慎对待环境变量！
		'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'unavailable'),
		'process.env.SHOULD_CONVERT_WIKITEXT_TO_HTML': '"true"',
	},

	// specify entry point for each environment.
	// (currently the plugin assumes `rollupOptions.input.index` for some features.)
	environments: {
		// `rsc` environment loads modules with `react-server` condition.
		// this environment is responsible for:
		// - RSC stream serialization (React VDOM -> RSC stream)
		// - server functions handling
		rsc: {
			build: {
				rolldownOptions: {
					input: {
						index: './framework/entry.rsc.tsx',
					},
				},
			},
		},

		// `ssr` environment loads modules without `react-server` condition.
		// this environment is responsible for:
		// - RSC stream deserialization (RSC stream -> React VDOM)
		// - traditional SSR (React VDOM -> HTML string/stream)
		ssr: {
			build: {
				rolldownOptions: {
					input: {
						index: './framework/entry.ssr.tsx',
					},
				},
			},
		},

		// client environment is used for hydration and client-side rendering
		// this environment is responsible for:
		// - RSC stream deserialization (RSC stream -> React VDOM)
		// - traditional CSR (React VDOM -> Browser DOM tree mount/hydration)
		// - refetch and re-render RSC
		// - calling server functions
		client: {
			build: {
				rolldownOptions: {
					input: {
						index: './framework/entry.browser.tsx',
					},
				},
			},
		},
	},
})
