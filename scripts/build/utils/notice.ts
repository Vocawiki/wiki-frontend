function sourceFileURL(path: string) {
	path = path.replaceAll('\\', '/')
	return `https://github.com/Vocawiki/wiki-frontend/blob/main/${path}`
}

export function noticeForEditors(path: string): string[] {
	return ['本页面为自动生成，请勿直接修改！否则你的编辑将被覆盖！！！', `请至 ${sourceFileURL(path)} 修改源代码。`]
}
