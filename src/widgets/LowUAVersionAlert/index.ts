/**
 * 这段代码需要单独拿出来，而不能放site-js里。
 * 这是因为如果浏览器版本过低不支持site-js里的语法或函数，
 * 会导致检测低版本浏览器的代码永远无法被执行，失去了意义。
 */

const componentHTML = `<div
	id="low-ua-version-alert"
	class="preflight"
	role="alertdialog"
	aria-labelledby="low-ua-version-alert-label"
	aria-describedby="low-ua-version-alert-desc"
	style="
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		line-height: 1.25;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		bottom: env(safe-area-inset-bottom);
		left: env(safe-area-inset-left);
		right: env(safe-area-inset-right);
		z-index: 200;
		pointer-events: none;
	"
>
	<div
		style="
			display: flex;
			align-items: center;
			padding: 1rem 0.875rem 1rem 1rem;
			color: #ffffff;
			background-color: #df185f;
			pointer-events: auto;
			border-radius: 0.5rem;
			margin: 1rem 1rem 2rem;
			box-shadow: 0 0.25rem 1rem rgba(223, 24, 95, 0.5);
		"
	>
		<div>
			<span id="low-ua-version-alert-label"
				>你的浏览器内核版本过低，网站内容与功能可能无法按预期呈现与生效，建议升级/更换浏览器。</span
			><span id="low-ua-version-alert-desc"
				>请查阅<a
					href="/Help:%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7"
					title="Help:浏览器兼容性"
					style="
						color: #fff1b7;
						text-decoration: underline;
						text-underline-offset: 0.25em;
						text-decoration-thickness: from-font;
					"
					>帮助:浏览器兼容性</a
				>。</span
			>
		</div>
		<button
			type="button"
			class="select-none"
			aria-label="关闭提示"
			onclick="document.getElementById('low-ua-version-alert').remove()"
			style="
				display: flex;
				align-items: center;
				justify-content: center;
				flex-shrink: 0;
				margin-left: 1rem;
				background-color: #fff;
				width: 1.25em;
				height: 1.25em;
				border-radius: 1em;
				cursor: pointer;
			"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				stroke="#df185f"
				stroke-width="2.5"
				stroke-linecap="round"
				style="width: 1em; height: 1em"
			>
				<path d="M18 6 6 18"></path>
				<path d="m6 6 12 12"></path>
			</svg>
		</button>
	</div>
</div>`

/**
 * 支持矩阵：
 * - Windows 7最后一个版本：
 *   - Chrome 109
 *     https://developer.chrome.com/blog/new-in-chrome-109
 *   - Firefox 115
 *     https://www.firefox.com/en-US/firefox/115.0/releasenotes/
 * - Safari 16.4
 *   https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes
 */
const doesUAMeetMinimumVersion = ((cssSupports): boolean => {
	if (cssSupports('width', '1lh')) {
		// Chrome >= 109, Safari >= 16.4, Firefox >= 120
		return true
	}

	if (!cssSupports('animation-composition', 'add')) {
		// Chrome < 112, Safari < 16.0, Firefox < 115
		return false
	}
	// 16.0 <= Safari < 16.4, 115 <= Firefox < 120

	if (cssSupports('selector(:dir(ltr))')) {
		// Firefox >= 115
		return true
	}

	// 16.0 <= Safari < 16.4
	return false
})(CSS.supports)

if (!doesUAMeetMinimumVersion) {
	document.body.insertAdjacentHTML('beforeend', componentHTML)
}
