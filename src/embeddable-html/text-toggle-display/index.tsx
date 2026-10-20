import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * only for {{tl|切换显示按钮}}
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:TextToggleDisplay?action=history
 */
export default function TextToggleDisplay({
	script,
}: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.textToggleDisplayButtons {
	display: inline-flex;
	flex-wrap: wrap;
	align-items: baseline;
	align-content: flex-start;
	user-select: none;
}

.textToggleDisplayButtonLabel {
	border: 1px solid rgba(0, 0, 0, .3);
	border-left-width: 4px;
	border-radius: 2px;
	flex: 1 0 auto;
	margin: 4px;
	padding: 0 8px;
	box-shadow: 1px 1px 2px black;
	color: rgba(0, 0, 0, .7);
	transition: .13s ease-in-out all;
	background-color: white;
}

.textToggleDisplayButtonLabel.cancelButton {
	line-height: normal;
}

.textToggleDisplayButtonLabel.on {
	border-color: rgba(0, 0, 0, 1);
	color: rgba(0, 0, 0, 1);
}

.textToggleDisplay.hidden,
.textToggleDisplayButtonsStyle,
.textToggleDisplayStyle,
.textToggleDisplayButtonLabel:not(.on) .textToggleDisplayButtonLabelText.on,
.textToggleDisplayButtonLabel.on .textToggleDisplayButtonLabelText.off,
.textToggleDisplayButtonLabel.cancelButton > input {
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
