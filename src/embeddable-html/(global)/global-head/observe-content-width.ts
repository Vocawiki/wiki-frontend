const mainContainerId = 'mw-content-text'
// 从sm到2xl的断点与Tailwind CSS相同
const breakpoints: [number, string][] = [
	[28 * 16, '2xs'],
	[32 * 16, 'xs'],
	[40 * 16, 'sm'],
	[48 * 16, 'md'],
	[64 * 16, 'lg'],
	[80 * 16, 'xl'],
	[96 * 16, '2xl'],
]

const contentContainer = document.getElementById(mainContainerId)
if (contentContainer) {
	observeResize(contentContainer)
} else {
	observeDOMMutation(document)
}

function observeResize(target: Element) {
	const bodyClassList = document.body.classList
	const breakpointsAndNames = breakpoints.map(
		([breakpoint, name]) => [breakpoint, `main-${name}`] as const,
	)
	const maxBreakpointIndex = breakpointsAndNames.length - 1

	const resizeObserver = new ResizeObserver(([entry]) => {
		// https://caniuse.com/mdn-api_resizeobserverentry_contentboxsize
		const width =
			'contentBoxSize' in entry! ? entry.contentBoxSize[0]!.inlineSize : entry!.contentRect.width

		let i = maxBreakpointIndex
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

				const queriedElem = addedElem.querySelector(`#${mainContainerId}`)
				if (!queriedElem) continue

				observeResize(queriedElem)
				observer.disconnect()
				return
			}
		}
	})
	mutationObserver.observe(target, { subtree: true, childList: true })
}
