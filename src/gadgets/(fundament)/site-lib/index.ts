export type MwLanguage =
	| 'zh'
	| 'zh-hans'
	| 'zh-hant'
	| 'zh-cn'
	| 'zh-sg'
	| 'zh-tw'
	| 'zh-hk'
	| 'zh-mo'

type WgUxs = (
	wg: MwLanguage,
	hans?: string,
	hant?: string,
	cn?: string,
	tw?: string,
	hk?: string,
	sg?: string,
	zh?: string,
	mo?: string,
	my?: string,
) => string

type WgUls = (
	hans?: string,
	hant?: string,
	cn?: string,
	tw?: string,
	hk?: string,
	sg?: string,
	zh?: string,
	mo?: string,
	my?: string,
) => string

type WgUvs = WgUls

declare global {
	const wgUXS: WgUxs
	const wgULS: WgUls
	const wgUVS: WgUvs

	interface Window {
		wgUXS: WgUxs
		wgULS: WgUls
		wgUVS: WgUvs
	}
}

window.wgUXS = (
	wg: MwLanguage,
	hans?: string,
	hant?: string,
	cn?: string,
	tw?: string,
	hk?: string,
	sg?: string,
	zh?: string,
	mo?: string,
	my?: string,
): string => {
	const ret: Record<MwLanguage, string | undefined> = {
		zh: zh || hans || hant || cn || tw || hk || sg || mo || my,
		'zh-hans': hans || cn || sg || my,
		'zh-hant': hant || tw || hk || mo,
		'zh-cn': cn || hans || sg || my,
		'zh-sg': sg || hans || cn || my,
		'zh-tw': tw || hant || hk || mo,
		'zh-hk': hk || hant || mo || tw,
		'zh-mo': mo || hant || hk || tw,
	}
	const str = ret[wg] || zh || hans || hant || cn || tw || hk || sg || mo || my // 保证每一语言都有值
	if (str === undefined) {
		throw new Error('未定义任何语言的字符串')
	}
	return str
}

window.wgULS = (
	hans?: string,
	hant?: string,
	cn?: string,
	tw?: string,
	hk?: string,
	sg?: string,
	zh?: string,
	mo?: string,
	my?: string,
) => {
	return window.wgUXS(
		mw.config.get('wgUserLanguage') as MwLanguage,
		hans,
		hant,
		cn,
		tw,
		hk,
		sg,
		zh,
		mo,
		my,
	)
}

window.wgUVS = (
	hans?: string,
	hant?: string,
	cn?: string,
	tw?: string,
	hk?: string,
	sg?: string,
	zh?: string,
	mo?: string,
	my?: string,
) => {
	return window.wgUXS(
		mw.config.get('wgUserVariant') as MwLanguage,
		hans,
		hant,
		cn,
		tw,
		hk,
		sg,
		zh,
		mo,
		my,
	)
}
