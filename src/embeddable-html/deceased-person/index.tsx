import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * Only for {{tl|已故现实人物}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:DeceasedPerson?action=history
 */
export default function DeceasedPerson({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
html,
body {
	position: relative;
	height: unset !important;
	min-height: 100vw;
}

html {
	transition: .37s filter ease-in-out;
	filter: none;
	background: #f6f6f6;
}

html.gray {
	filter: grayscale(100%);
	-webkit-filter: grayscale(100%);
	-moz-filter: grayscale(100%);
	-ms-filter: grayscale(100%);
	-o-filter: grayscale(100%)
}

html.gray:before {
	content: "";
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.please-donate {
	display: none !important;
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
