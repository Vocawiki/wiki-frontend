export const createApi = (): mw.Api =>
	new mw.Api({
		parameters: {
			errorformat: 'plaintext',
		},
	})
