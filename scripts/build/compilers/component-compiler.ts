import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { Promisable } from 'type-fest'

export function compileComponent(component: ReactNode): Promisable<string> {
	const html = renderToStaticMarkup(component)
	return html
}
