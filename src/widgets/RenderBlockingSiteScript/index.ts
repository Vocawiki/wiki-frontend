const mainContainerId = 'mw-content-text'
// 断点与 Tailwind CSS 相同
const breakpoints: [number, string][] = [
	[640, 'sm'],
	[768, 'md'],
	[1024, 'lg'],
	[1280, 'xl'],
	[1536, '2xl'],
]

const contentContainer = document.getElementById(mainContainerId)
if (contentContainer) {
	observeResize(contentContainer)
}

function observeResize(observedTarget: Element) {
	const classList = document.body.classList
	const breakpointsAndClasses = breakpoints.map(([breakpoint, name]) => [breakpoint, 'main-' + name] as const)

	const resizeObserver = new ResizeObserver((entries) => {
		const { contentBoxSize, contentRect } = entries[0]!
		const width = contentBoxSize ? contentBoxSize[0]!.inlineSize : contentRect.width

		let i = breakpointsAndClasses.length - 1
		for (; i >= 0; i--) {
			const [breakpoint, className] = breakpointsAndClasses[i]!
			if (width < breakpoint) {
				classList.remove(className)
			} else {
				break
			}
		}
		for (; i >= 0; i--) {
			const [, className] = breakpointsAndClasses[i]!
			classList.add(className)
		}
	})
	resizeObserver.observe(observedTarget, { box: 'content-box' })
}
