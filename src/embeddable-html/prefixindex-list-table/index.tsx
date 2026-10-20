import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * 本widget是为了提升{{tl|Subpagelist}}的可识别性而设立的
 *
 * 作者：[[zhmoe:User:Nbdd0121]]（XYZ指示物）、[[zhmoe:User:AnnAngela]]
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:PrefixindexListTable?action=history
 */
export default function PrefixindexListTable({
	script,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
table.mw-prefixindex-list-table td {
	text-align:center;
	border:1px solid #a7d7f9;
	width:33%;
}
table.mw-prefixindex-list-table {
	border-collapse: collapse;
	margin-bottom: 1em;
	width: 100%;
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
