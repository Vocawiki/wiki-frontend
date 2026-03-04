import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Promisable } from 'type-fest'

export function compileComponent(node: ReactNode): Promisable<string> {
	const html = renderToStaticMarkup(node)
	return html
}
