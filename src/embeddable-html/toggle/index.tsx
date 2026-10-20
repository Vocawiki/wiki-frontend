import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * for {{tl|Toggle}} {{tl|Toggle 内联按钮}} {{tl|ToggleInline}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Toggle?action=history
 */
export default function Toggle({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
html.client-js .mw-customcollapsible-body {
	display: none;
}
`}</style>
			<script type="module">{script}</script>
		</>
	)
}

export const getStaticProps: GetStaticProps<{ script: string }> = async () => {
	const script = await compileJS(`${import.meta.dirname}/script.ts`)
	return { props: { script } }
}
