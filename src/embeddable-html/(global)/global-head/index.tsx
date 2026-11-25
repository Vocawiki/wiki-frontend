import '@/lib/server-only'

import { outputFile } from 'fs-extra/esm'
import pProps from 'p-props'

import { stringHash } from '@/lib/hash'
import { compileJS, compileCSS } from '@/scripts/build/compilers'
import {
	ASSETS_BASE_URL_IMPLICIT_ORIGIN,
	ASSETS_DIR,
	SOURCE_PATH_TAILWIND_THEME,
} from '@/scripts/config'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

export default function GlobalHead({
	styleUrl,
	scriptContent,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<link rel="stylesheet" href={styleUrl} />
			{/* 为了阻塞渲染，此处不使用type="module" */}
			<script>{scriptContent}</script>
		</>
	)
}

export const getStaticProps: GetStaticProps<{
	styleUrl: string
	scriptContent: string
}> = async () => {
	const props = await pProps({
		styleUrl: (async () => {
			const content = await compileCSS(SOURCE_PATH_TAILWIND_THEME)
			const hash = await stringHash(content, { alphabet: 'base64url', lengthInString: 8 })
			const fileName = `global-${hash}.css`
			await outputFile(`${ASSETS_DIR}/${fileName}`, content)
			return `${ASSETS_BASE_URL_IMPLICIT_ORIGIN}/${fileName}`
		})(),
		scriptContent: compileJS(`${import.meta.dirname}/observe-content-width.ts`),
	})

	return { props }
}
