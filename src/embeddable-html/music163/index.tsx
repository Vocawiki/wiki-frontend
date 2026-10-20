import pProps from 'p-props'

import { compileCSS, compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * Only for {{tl|Music163}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Music163?action=history
 */
export default function Music163({
	styles,
	script,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{styles}</style>
			<script type="module">{script}</script>
		</>
	)
}

export const getStaticProps: GetStaticProps<{ styles: string; script: string }> = async () => {
	return {
		props: await pProps({
			styles: compileCSS(`${import.meta.dirname}/styles.css`),
			script: compileJS(`${import.meta.dirname}/script.ts`),
		}),
	}
}
