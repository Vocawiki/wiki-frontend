/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:MathJax?action=history
 */
;(() => {
	window.MathJax = {
		startup: {
			elements: ['.mw-parser-output'],
		},
		tex: {
			inlineMath: [
				['$', '$'],
				['\\(', '\\)'],
			],
			displayMath: [
				['$$', '$$'],
				['\\[', '\\]'],
			],
			processEscapes: true,
			autoload: {
				color: [],
				colorV2: ['color'],
			},
			packages: {
				'[+]': ['color', 'mhchem'],
			},
		},
		loader: {
			load: ['[tex]/color', '[tex]/mhchem'],
		},
		options: {
			ignoreHtmlClass: {
				'[+]': ['diffchange-inline', 'diffchange', 'diff-addedline', 'diff-deletedline', 'diff'],
			},
			processHtmlClass: {
				'[+]': ['mathjax_process'],
			},
		},
	}
	const script = document.createElement('script')
	script.src = 'https://code.bdstatic.com/npm/mathjax@3.2.0/es5/tex-svg-full.js'
	script.integrity = 'sha256-RiD0Wnc8F/rkqcI3DrRvgFSNvolq9VBzLEwcT/nwt6A='
	script.crossOrigin = 'anonymous'
	script.async = true
	script.addEventListener('load', () => {
		let promise = Promise.resolve()
		window.RLQ ??= []
		// @ts-expect-error RLQ 也支持只传回调，但类型定义仅允许 [依赖, 回调] 元组
		window.RLQ.push(() => {
			const promiseJoin = () =>
				(promise = promise.then(() =>
					window.MathJax && typeof MathJax.typesetPromise === 'function'
						? MathJax.typesetPromise()
						: Promise.resolve(),
				))
			void promiseJoin()
			$(() => {
				void promiseJoin()
			})
		})
	})
	document.head.appendChild(script)
})()
