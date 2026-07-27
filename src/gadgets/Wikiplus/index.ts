void (async () => {
	await libCachedCode.injectCachedCode('https://npm.elemecdn.com/wikiplus-core@latest', 'script')
	if (!document.querySelector('#ca-edit')) {
		return
	}
	let wikiplusEditTopBtn = document.querySelector('#Wikiplus-Edit-TopBtn')
	while (!wikiplusEditTopBtn) {
		await new Promise((res) => setTimeout(res, 300))
		wikiplusEditTopBtn = document.querySelector('#Wikiplus-Edit-TopBtn')
	}
	$('.page-tool-link#ca-wikiplus').insertAfter($('.page-tool-link#ca-edit'))
})()
