import type { ReactNode } from 'react'
import { prerender } from 'react-dom/static'

export async function compileComponent(node: ReactNode): Promise<string> {
	// 为了支持异步组件，这里不使用renderToStaticMarkup
	const { prelude } = await prerender(node, {})
	const html = (await new Response(prelude).text())
		.replaceAll('<!-- -->' /* React Stream自带 */, '')
		.replace(/--构建时去掉这个属性名和后面的冒号只保留值-\d+:/gu, '')
	return html
}
