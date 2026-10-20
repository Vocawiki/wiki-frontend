import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:SongCats?action=history
 */
export default function SongCats({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.mw-daily-catlinks li > img {
	margin: 0 6px 3px 0;
}

body.skin-citizen .mw-daily-catlinks li {
	display: block;
	padding: var(--space-xxs) var(--space-sm);
	color: var(--color-base);
	border: var(--border-width-base) solid var(--border-color-interactive);
	border-radius: var(--border-radius-pill);
}

body.skin-citizen .mw-daily-catlinks li > a {
	display: inline;
	border: none;
	padding: 0;
}

body.skin-citizen .mw-daily-catlinks:first-line {
	color: var(--color-subtle);
	font-family: var(--font-family-overline);
	font-weight: var(--font-weight-overline);
	line-height: var(--line-height-overline);
	text-transform: var(--text-transform-overline);
	letter-spacing: var(--letter-spacing-overline);
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
