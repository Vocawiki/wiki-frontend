import type { ReactNode } from 'react'
import { renderToReadableStream } from 'react-dom/server'

export async function compileComponent(node: ReactNode): Promise<string> {
	// 为了支持异步组件，这里不使用renderToStaticMarkup
	const stream = await renderToReadableStream(node)
	const html = (await new Response(stream).text()).replaceAll('<!-- -->' /* React Stream自带 */, '')

	return html
}
