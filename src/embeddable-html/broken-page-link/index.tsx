import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * 仅供[[:Category:含有受损文件链接的页面]]使用
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:BrokenPageLink?action=history
 */
export default function BrokenPageLink({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.BrokenPageLink .mw-category-group > ul {
	list-style: none none;
	margin-left: 0.25em;
}
.mw-category-group > ul > li > a {
	margin-left: 18px;
}
.mw-category-important ul {
	-webkit-column-count: 3;
	-moz-column-count: 3;
	column-count: 3;
	-webkit-column-width: 24em;
	-moz-column-width: 24em;
	column-width: 24em;
}
.mw-category-group {
	clear: both;
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
