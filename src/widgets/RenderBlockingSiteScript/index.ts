;(function 为ParserOutput附加容器大小信息() {
	const PARSER_OUTPUT_CLASS_NAME = 'mw-parser-output'
	// 断点与 Tailwind CSS 相同
	const breakpoints: [number, string][] = [
		[640, 'sm'],
		[768, 'md'],
		[1024, 'lg'],
		[1280, 'xl'],
		[1536, '2xl'],
	]

	const contentToInfoMap = new Map<Element, Element>()
	const resizeObserver = new ResizeObserver((entries) => {
		entries.forEach(function handleParserOutputResize({ contentBoxSize, contentRect, target }) {
			const infoElem = contentToInfoMap.get(target)
			if (!infoElem) return

			const classList = infoElem.classList
			const inlineSize = contentBoxSize ? contentBoxSize[0]!.inlineSize : contentRect.width

			for (const [pixels, className] of breakpoints) {
				if (inlineSize >= pixels) {
					classList.add(className)
				} else {
					classList.remove(className)
				}
			}
		})
	})

	function attachDynamicInfo(parserOutputElem: Element) {
		const infoElem = document.createElement('div')
		infoElem.setAttribute('hidden', '')
		infoElem.classList.add('__info')
		parserOutputElem.insertAdjacentElement('afterbegin', infoElem)
		contentToInfoMap.set(parserOutputElem, infoElem)
		resizeObserver.observe(parserOutputElem)
	}

	function detachDynamicInfo(parserOutputElem: Element) {
		contentToInfoMap.delete(parserOutputElem)
		resizeObserver.unobserve(parserOutputElem)
	}

	function attachDynamicInfoInDescendants(parent: Element | Document) {
		const parserOutputElements = [...parent.getElementsByClassName(PARSER_OUTPUT_CLASS_NAME)]
		parserOutputElements.forEach(attachDynamicInfo)
	}

	function detachDynamicInfoInDescendants(parent: Element | Document) {
		const parserOutputElements = [...parent.getElementsByClassName(PARSER_OUTPUT_CLASS_NAME)]
		parserOutputElements.forEach(detachDynamicInfo)
	}

	attachDynamicInfoInDescendants(document)

	const mutationObserver = new MutationObserver((mutations) => {
		mutations.forEach(function handleChildListMutation(mutation) {
			const target = mutation.target
			if (!(target instanceof Element)) return
			if (target.classList.contains(PARSER_OUTPUT_CLASS_NAME)) return

			mutation.addedNodes.forEach((addedNode) => {
				if (!(addedNode instanceof Element)) return
				if (addedNode.classList.contains(PARSER_OUTPUT_CLASS_NAME)) {
					attachDynamicInfo(addedNode)
					return
				}
				attachDynamicInfoInDescendants(addedNode)
			})

			mutation.removedNodes.forEach((removedNode) => {
				if (!(removedNode instanceof Element)) return
				if (removedNode.classList.contains(PARSER_OUTPUT_CLASS_NAME)) {
					detachDynamicInfo(removedNode)
					return
				}
				detachDynamicInfoInDescendants(removedNode)
			})
		})
	})
	mutationObserver.observe(document.body, { subtree: true, childList: true })
})()
