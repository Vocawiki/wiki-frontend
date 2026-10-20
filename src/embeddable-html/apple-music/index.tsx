import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * Only for {{tl|AppleMusic}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:AppleMusic?action=history
 */
export default function AppleMusic({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.appleMusic {
	position: relative;
	display: flex;
	flex-wrap:wrap;
	justify-content: flex-start;
	align-items: flex-start;
	align-content: flex-start;
	max-width: 100%;
}
.appleMusic iframe {
	border: none;
	margin: 0;
	max-width: 100%;
}
body .appleMusic .subinfo img {
	height: 1rem!important;
	margin-left: .25rem;
	max-width: none!important;
}
.appleMusic .subinfo {
	margin: 0 10px;
}
.appleMusic.float-left {
	float: left;
	padding-right: 33px;
}
.appleMusic.float-right {
	float: right;
	padding-right: 33px;
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
