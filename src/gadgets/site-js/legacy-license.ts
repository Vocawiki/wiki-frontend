const MINIMAL_REVISION_ID_FOR_NEW_LICENSE = 188873 // 2026-06-06第一笔编辑

/**
 * 2026年6月6日网站的许可协议发生了变化（公告：https://voca.wiki/?curid=70667）
 * 新内容为CC BY-NC-SA 4.0，但旧的页面版本仍保持3.0 CN。
 * 由于MediaWiki无法为不同版本的页面设置不同的许可证，因此需要在前端进行替换。
 */
export function clarifyOldRevisionLicense(): void {
	// https://www.mediawiki.org/wiki/Manual:Interface/JavaScript#All_pages_(user/page-specific)
	const revisionId = mw.config.get('wgRevisionId')

	if (revisionId === 0) return

	if (revisionId < MINIMAL_REVISION_ID_FOR_NEW_LICENSE) {
		// 替换旧版本的许可证
		clarifyLicenseText()
	}
}

/**
 * 找到许可证文本所在的元素，并在其后添加说明文本，说明当前页面的当前版本采用了不同的许可证。
 */
function clarifyLicenseText(): void {
	const ele = document.getElementById('vocawiki-content-license')
	if (!ele) return

	const description = getDescriptionByLanguage(mw.config.get('wgUserLanguage'))
	ele.insertAdjacentHTML('beforeend', description)
}

function getDescriptionByLanguage(lang: string): string {
	if (lang.startsWith('en-')) {
		lang = 'en'
	}

	switch (lang) {
		default:
			return '而当前页面的当前版本采用<a class="external" href="https://creativecommons.org/licenses/by-nc-sa/3.0/cn/deed.zh-hans">知识共享 署名-非商业性使用-相同方式共享 3.0中国大陆</a>授权。'
		case 'zh-hk':
			return '而當前頁面的當前版本採用<a class="external" href="https://creativecommons.org/licenses/by-nc-sa/3.0/cn/deed.zh-hant">共享創意 姓名標示-非商業性-相同方式分享 3.0 中國大陸</a>授權。'
		case 'zh-hant':
		case 'zh-tw':
			return '而當前頁面的當前版本採用<a class="external" href="https://creativecommons.org/licenses/by-nc-sa/3.0/cn/deed.zh-hant">創用CC 姓名標示-非商業性-相同方式分享 3.0 中國大陸</a>授權。'
		case 'en':
			return ' The current version of the current page is licensed under <a class="external" href="https://creativecommons.org/licenses/by-nc-sa/3.0/cn/deed.en">Creative Commons Attribution-NonCommercial-ShareAlike 3.0 China Mainland</a> instead.'
	}
}
