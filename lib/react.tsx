import type { CSSProperties } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const markupStart = '<div style="'
const markupEnd = '"></div>'
const markupSliceStart = markupStart.length
const markupSliceEnd = -markupEnd.length

export function cssPropertiesToString(properties: CSSProperties): string {
	const markup = renderToStaticMarkup(<div style={properties} />)
	if (!(markup.startsWith(markupStart) && markup.endsWith(markupEnd))) {
		throw new Error(`不合预期的HTML：${markup}`)
	}
	return markup.slice(markupSliceStart, markupSliceEnd)
}
