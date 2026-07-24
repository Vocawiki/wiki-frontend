type MwLanguage = 'zh' | 'zh-hans' | 'zh-hant' | 'zh-cn' | 'zh-sg' | 'zh-tw' | 'zh-hk' | 'zh-mo'

// @ts-expect-error 懒得标记全局类型了，这些函数迟早要被取代掉
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
	return ret[wg] || zh || hans || hant || cn || tw || hk || sg || mo || my! // 保证每一语言都有值
}

// @ts-expect-error 懒得标记全局类型了，这些函数迟早要被取代掉
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
	// @ts-expect-error 懒得标记全局类型了，这些函数迟早要被取代掉
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	return window.wgUXS(mw.config.get('wgUserLanguage'), hans, hant, cn, tw, hk, sg, zh, mo, my)
}

// @ts-expect-error 懒得标记全局类型了，这些函数迟早要被取代掉
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
	// @ts-expect-error 懒得标记全局类型了，这些函数迟早要被取代掉
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
	return window.wgUXS(mw.config.get('wgUserVariant'), hans, hant, cn, tw, hk, sg, zh, mo, my)
}
