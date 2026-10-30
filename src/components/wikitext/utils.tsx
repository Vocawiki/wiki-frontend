import '@/lib/server-only'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export function RawWikitext({ content }: { content: string }) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		throw new Error('预览模式不应使用<RawWikitext />')
	}
	// @ts-expect-error 此处remove-me仅为占位，构建时会清除
	return <remove-me dangerouslySetInnerHTML={{ __html: content }} />
}
