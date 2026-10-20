/**
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:NoSubpage?action=history
 */
// oxlint-disable max-statements -- 片段是一次性执行的初始化流程，拆分需把闭包内状态外提，行为风险大于收益
;(() => {
	const noSubpage = document.querySelector<HTMLElement>('#noSubpage')
	const wgPageName = mw.config.get('wgPageName')
	if (!wgPageName.includes('/') || !noSubpage) {
		return
	}

	const dataVars = (noSubpage.dataset.vars || '').split('|')
	const dataVarsLength = dataVars.length
	const titleParts = wgPageName.split('/')
	const titlePartsLength = titleParts.length - 1

	if (!dataVarsLength || (dataVarsLength === 1 && dataVars[0] === '')) {
		document.querySelector('.subpages')!.remove()
		return
	}

	const oldSubpages = document.querySelector<HTMLElement>('.subpages')!
	const subpages = document.createElement('span')
	subpages.classList.add('subpages')
	const icon = document.createElement('span')
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	svg.style.width = '1em'
	svg.style.height = '1em'
	svg.setAttribute('viewBox', '0 0 256 512')
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute(
		'd',
		'M31.7 239l136-136c9.4-9.4 24.6-9.4 33.9 0l22.6 22.6c9.4 9.4 9.4 24.6 0 33.9L127.9 256l96.4 96.4c9.4 9.4 9.4 24.6 0 33.9L201.7 409c-9.4 9.4-24.6 9.4-33.9 0l-136-136c-9.5-9.4-9.5-24.6-.1-34z',
	)
	path.setAttribute('fill', 'currentColor')
	subpages.append(icon)
	icon.append(svg)
	svg.append(path)

	let href = ''
	let prependText = ''

	for (let index = 0; index < titlePartsLength; index++) {
		const join = `${titleParts[index]}/${titleParts[index + 1]}`
		let toBeContinued = false
		for (let i = 0; i < dataVarsLength; i++) {
			const dataVar = dataVars[i]!
			if (join.includes(dataVar) || dataVar.includes(join)) {
				prependText += `${titleParts[index]}/`
				toBeContinued = true
				break
			}
		}
		if (toBeContinued) {
			continue
		}
		const anchorText = prependText + titleParts[index]
		prependText = ''
		href += `/${anchorText}`
		const textnode = document.createElement('span')
		textnode.innerText = ' '
		subpages.append(textnode)
		const link = document.createElement('a')
		link.innerText = anchorText
		link.href = href
		subpages.append(link)
		if (titlePartsLength - index > 1) {
			subpages.append(' |')
		}
	}
	if (subpages.querySelector('a')) {
		oldSubpages.after(subpages)
		oldSubpages.remove()
	}
})()
