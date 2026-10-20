/**
 * 这段代码需要单独拿出来，而不能放site-js里。
 * 这是因为如果浏览器版本过低不支持site-js里的语法或函数，检测低版本浏览器的代码将永远无法被执行。
 */

/**
 * 支持矩阵（链接中含这些版本的新特性）：
 * - Windows 7最后一个版本：
 *   - Chrome 109
 *	 https://developer.chrome.com/blog/new-in-chrome-109
 *   - Firefox 115
 *	 https://www.firefox.com/en-US/firefox/115.0/releasenotes/
 * - Safari 16.4
 *   https://developer.apple.com/documentation/safari-release-notes/safari-16_4-release-notes
 */
const doesUAMeetMinimumVersion = ((): boolean => {
	try {
		if (CSS.supports('width', '1lh')) {
			// Chrome >= 109, Safari >= 16.4, Firefox >= 120
			return true
		}

		if (!CSS.supports('animation-composition', 'add')) {
			// Chrome < 112, Safari < 16.0, Firefox < 115
			return false
		}
		// 16.0 <= Safari < 16.4, 115 <= Firefox < 120

		if (CSS.supports('selector(:dir(ltr))')) {
			// Firefox >= 115
			return true
		}
	} catch {
		return false
	}

	// 16.0 <= Safari < 16.4
	return false
})()

if (!doesUAMeetMinimumVersion) {
	const element = document.getElementById('low-ua-version-alert')!
	element.querySelector('button')!.addEventListener('click', () => {
		element.remove()
	})
	element.hidden = false
}
