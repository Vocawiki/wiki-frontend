export const createApi = (): mw.Api =>
	new mw.Api({
		parameters: {
			uselang: mw.config.get('wgUserLanguage'),
			errorformat: 'plaintext',
		},
	})
