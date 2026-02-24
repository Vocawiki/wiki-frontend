import assert from 'node:assert/strict'

export interface FileInfo {
	baseName: string
	extension: string
}

export function getFileInfo(fileName: string): FileInfo {
	const match = fileName.match(/^(.*)\.([^.]+)$/)
	assert(match, `不受支持的文件名：${fileName}`)

	const baseName = match[1]!
	const extension = match[2]!

	return { baseName, extension }
}
