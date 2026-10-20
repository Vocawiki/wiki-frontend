import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * Only for {{tl|Echart}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:Echart?action=history
 */
export default function Echart({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.echart-data {
	display: none;
}

.echart-app {
	max-width: 100%;
	overflow-x: auto;
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
