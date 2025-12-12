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
} else {
	observeDOMMutation(document.body)
}

function observeResize(target: Element) {
	const bodyClassList = document.body.classList
	const breakpointsAndNames = breakpoints.map(
		([breakpoint, name]) => [breakpoint, 'main-' + name] as const,
	)

	const resizeObserver = new ResizeObserver((entries) => {
		const { contentBoxSize, contentRect } = entries[0]!
		const width = contentBoxSize ? contentBoxSize[0]!.inlineSize : contentRect.width

		let i = breakpointsAndNames.length - 1
		for (; i >= 0; i--) {
			const [breakpoint, className] = breakpointsAndNames[i]!
			if (width < breakpoint) {
				bodyClassList.remove(className)
			} else {
				break
			}
		}
		for (; i >= 0; i--) {
			const [, className] = breakpointsAndNames[i]!
			bodyClassList.add(className)
		}
	})
	resizeObserver.observe(target, { box: 'content-box' })
}

function observeDOMMutation(target: Node) {
	const elementNodeType = Node.ELEMENT_NODE
	const mutationObserver = new MutationObserver((mutations, observer) => {
		for (const { addedNodes } of mutations) {
			for (const addedNode of addedNodes) {
				if (addedNode.nodeType !== elementNodeType) continue

				const addedElem = addedNode as Element
				if (addedElem.id === mainContainerId) {
					observeResize(addedElem)
					observer.disconnect()
					return
				}

				const queriedElem = addedElem.querySelector('#' + mainContainerId)
				if (!queriedElem) continue

				observeResize(queriedElem)
				observer.disconnect()
				return
			}
		}
	})
	mutationObserver.observe(target, { subtree: true, childList: true })
}
