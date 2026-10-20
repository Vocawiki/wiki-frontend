import { compileJS } from '@/scripts/build/compilers'
// oxlint-disable max-lines-per-function -- 组件体量较大，拆分只会增加无谓的中间层
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * {{BilibiliVideo/doc/copyright}}
 *
 * '''本Widget不能单独使用'''，请使用{{tl|BilibiliVideo}}！
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:BilibiliVideo?action=history
 */
export default function BilibiliVideo({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.bilibili-video-container {
	border: 1px solid rgba(170,170,170,0.37);
	border-collapse: separate;
	max-width: 100%;
	box-sizing: content-box;
}
.bilibili-video-container.exec {
	display: table;
}
.bilibili-iframe-container,
.bilibili-video-container {
	display: none;
}
.bilibili-video-container,
.bilibili-video-container .bilibili-widescreen,
.bilibili-video-container iframe {
	max-width: 100%;
	background-color: #fff!important;
}
.bilibili-title {
	padding: .2em 6.5em .2em 1em;
	position: relative;
}
.bilibili-title a {
	word-break: break-word;
}
.bilibili-widescreen {
	position: absolute;
	display: none;
	width: 1em;
	right: calc(-2rem - 1px);
	border: 1px solid rgba(170,170,170,0.37);
	padding: .25rem .5rem;
	line-height: 1.5em;
	top: -2px;
	user-select: none;
	cursor: pointer;
}
.onshow .bilibili-widescreen{
	display: block;
}
.skin-citizen .bilibili-title {
	font-size: var(--font-size-small, 0.875rem);
}
.skin-citizen .bilibili-video-container,
.skin-citizen .bilibili-widescreen {
	border-radius: var(--border-radius-medium);
}
.bilibili-toggle {
	position: absolute;
	top: calc(50% - .5em);
	right: .7em;
	line-height: 1em;
	cursor: pointer;
	padding-left: 1em;
	background-image: url(/skins/Vector/images/search-ltr.png?39f97);
	background-image: linear-gradient(transparent,transparent),url(data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2213%22%3E%20%3Cg%20fill=%22none%22%20stroke=%22%2354595d%22%20stroke-width=%222%22%3E%20%3Cpath%20d=%22M11.29%2011.71l-4-4%22/%3E%20%3Ccircle%20cx=%225%22%20cy=%225%22%20r=%224%22/%3E%20%3C/g%3E%20%3C/svg%3E);
	background-position: left center;
	background-repeat: no-repeat;
}
.bilibili-toggle:hover {
	color: #36b;
}
.bilibili-video-button,
.bilibili-video-button:visited {
	display: inline-block;
	margin: 4px 5px;
	padding: 10px 25px;
	font-size: 14px;
	text-align: center;
	color: #fff;
	background: #de698c;
	border-radius: 4px;
}
.bilibili-iframe-container {
	padding: 6px;
	position: relative;
	border: 0 solid rgba(170,170,170,0.37);
	border-top-width: 1px;
}
.bilibili-video-container:not([data-max-width]) .bilibili-iframe-container {
	max-width: calc(100% - 12px)!important;
}
.bilibili-video-container:not([data-max-width]).onshow .bilibili-iframe-container {
	max-height: calc(100% - 27px)!important;
}
.bilibili-video-container textarea {
	background: white;
	color: black;
	width: 80%;
	margin: auto;
}
.bilibili-iframe-overlay {
	width: 0;
	height: 0;
	padding-top: 30%;
	text-align: center;
	box-sizing: border-box;
	background: rgb(167, 215, 249);
	position: absolute;
	top: 3px;
	left: 6px;
	z-index: 2;
}
.bilibili-iframe-retry-link {
	position: absolute;
	top: 10px;
	right: 10px;
	display: none;
	background: white;
	padding: 0 0.5em;
}
html > body > .navpopup .bilibili-video-container > * {
	display: none !important;
}
html > body > .navpopup .bilibili-video-container::before {
	content: "请不要在注释里使用 BilibiliVideo 模板";
	font-style: italic;
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
