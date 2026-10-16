import '@/lib/server-only'

import { SHOULD_CONVERT_WIKITEXT_TO_HTML } from '@/lib/config'

export async function ParserFunctionHtml({ name }: { name: string }) {
	if (SHOULD_CONVERT_WIKITEXT_TO_HTML) {
		const Component = ((await import(`~/html/${name}`)) as { default: React.ComponentType }).default
		return <Component />
	}

	return `{{#html:${name}}}`
}
