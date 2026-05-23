void (async () => {
	const { wgIsArticle, wgAction } = mw.config.get(['wgIsArticle', 'wgAction'])
	if (wgIsArticle && wgAction === 'view') {
		await libCachedCode.injectCachedCode(
			'https://testingcf.jsdelivr.net/npm/wikiplus-highlight@latest',
			'script',
		)
	}
})()
