import { BRANCH_NAME, REPO_URL } from '@/scripts/config'

function sourceFileURL(path: string) {
	path = path.replaceAll('\\', '/')
	return `${REPO_URL}/blob/${BRANCH_NAME}/${path}`
}

export function noticeForEditors(path: string): string[] {
	return [
		'本页面为自动生成，请勿直接修改！否则你的编辑将被覆盖！！！',
		`请至 ${sourceFileURL(path)} 修改源代码。`,
	]
}
