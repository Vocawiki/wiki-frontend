import { compileJS } from '@/scripts/build/compilers'
// oxlint-disable max-lines-per-function -- 组件体量较大，拆分只会增加无谓的中间层
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * '''本Widget不能单独使用'''，请使用{{tl|AcfunVideo}}！
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:AcfunVideo?action=history
 */
export default function AcfunVideo({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style>{`
.acfun-video-container {
	border: 1px solid rgba(170,170,170,0.37);
	max-width: 100%;
}
.acfun-video-container.exec {
	display: table;
}
.acfun-iframe-container,
.acfun-video-container {
	display: none;
}
.acfun-video-container,
.acfun-video-container .acfun-widescreen,
.acfun-video-container iframe {
	max-width: 100%;
	background-color: #fff!important;
}
.acfun-title {
	padding: .2em 6.5em .2em 1em;
	position: relative;
}
.acfun-title a {
	word-break: break-word;
}
.acfun-widescreen {
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
.onshow .acfun-widescreen{
	display: block;
}
.acfun-toggle {
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
.acfun-toggle:hover {
	color: #36b;
}
.acfun-video-button,
.acfun-video-button:visited {
	display: inline-block;
	margin: 4px 5px;
	padding: 10px 25px;
	font-size: 14px;
	text-align: center;
	color: #fff;
	background: #de698c;
	border-radius: 4px;
}
.acfun-iframe-container {
	padding: 6px;
	position: relative;
	border: 0 solid rgba(170,170,170,0.37);
	border-top-width: 1px;
}
.acfun-video-container:not([data-max-width]) .acfun-iframe-container {
	max-width: calc(100% - 12px)!important;
}
.acfun-video-container:not([data-max-width]).onshow .acfun-iframe-container {
	max-height: calc(100% - 27px)!important;
}
.acfun-video-container textarea {
	background: white;
	color: black;
	width: 80%;
	margin: auto;
}
.acfun-iframe-overlay {
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
.acfun-iframe-retry-link {
	position: absolute;
	top: 10px;
	right: 10px;
	display: none;
	background: white;
	padding: 0 0.5em;
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
