import tailwindcss from '@tailwindcss/postcss'
import postcss from 'postcss'

import { customPages, type GadgetMeta } from '@/tools/gadget'

export default {
	pages: [
		customPages(['site-styles.css'], async ({ noticeForEditors }) => {
			const entryDir = 'src/gadgets/site-styles'
			const entryPath = `${entryDir}/index.css`
			const css = await runPostCSS(entryPath)
			const content = `/**
 * ${noticeForEditors(entryDir).join('\n * ')}
 */
/* <pre> */
${css}
/* </pre> */`
			return { 'site-styles.css': content }
		}),
	],
	withResourceLoader: true,
	defaultEnabled: true,
	hidden: true,
	type: 'styles',
} satisfies GadgetMeta

async function runPostCSS(path: string) {
	const postcssInstance = postcss(tailwindcss({ base: 'src' }))
	const srcCSS = await Bun.file(path).text()
	const result = await postcssInstance.process(srcCSS, { from: path, to: undefined })

	return result.css
}
