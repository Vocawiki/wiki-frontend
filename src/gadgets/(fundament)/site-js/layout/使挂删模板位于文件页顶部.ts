export function 使挂删模板位于文件页顶部() {
	if (mw.config.get('wgNamespaceNumber') !== 6) return

	if ($('.ns-6 #mw-imagepage-content')[0] && $('.regToDel')[0]) {
		$('#file').before($('#mw-imagepage-content'))
	}
	$('.ns-6 .regToDel').css('margin-bottom', '1rem !important')
}
