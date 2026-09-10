/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
;(() => {
	const { wgUserName, wgScriptPath, skin } = mw.config.get(['wgUserName', 'wgScriptPath', 'skin'])
	const userId = mw.user.id()

	const newAvatar = (user, Id = false) => {
		const attrs = {
			src: `${wgScriptPath}/extensions/Avatar/avatar.php?user=${encodeURIComponent(user)}`,
			alt: user,
		}
		if (Id) attrs.id = 'citizen-avatar'
		return $('<img>', attrs)
	}

	const userpageId = skin === 'vector' ? '#pt-userpage' : '#pt-userpage-2'
	switch (skin) {
		case 'vector':
		case 'vector-2022': {
			const $avatar = $('<li>', {
				id: 'pt-avatar',
				class: 'mw-list-item',
			}).append(
				$('<a>', {
					href: mw.util.getUrl('Special:UploadAvatar'),
					title: '上传头像',
				}).append(newAvatar(userId)),
			)
			$(userpageId).before($avatar)
			break
		}
		case 'citizen':
			$('.citizen-dropdown-summary .mw-ui-icon-wikimedia-userAvatar').replaceWith(
				newAvatar(wgUserName, true),
			)
			break
	}
})()
