import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * 用来给{{tl|Navbox}}模板增添全隐全显按钮，作者[[zhmoe:User:AnnAngela]]。
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:LargeNavbox?action=history
 */
export default function LargeNavbox({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.largeNavbox-toggle {
	right: 6em
}
.skin-moeskin .largeNavbox-toggle {
	right: 4.5em
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
