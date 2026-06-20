void (async () => {
	const { wgIsArticle, wgAction } = mw.config.get(['wgIsArticle', 'wgAction'])
	if (wgIsArticle && wgAction === 'view') {
		// @ts-expect-error - mw.libs is used for assigning third-party libraries
		mw.libs.wphl = { cmVersion: 6 }
		await libCachedCode.injectCachedCode(
			'https://testingcf.jsdelivr.net/npm/wikiplus-highlight@latest',
			'script',
		)
	}
})()
