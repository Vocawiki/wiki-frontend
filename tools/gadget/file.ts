import assert from 'node:assert/strict'

import { srcDistExtensionMap } from './types'

export interface FileInfo {
	baseName: string
	extension: string
	builtExtension: string
}

export function getFileInfo(fileName: string): FileInfo {
	const match = fileName.match(/^(.*)\.([^.]+)$/)
	assert(match, `不受支持的文件名：${fileName}`)

	const baseName = match[1]!
	const extension = match[2]!

	if (!(extension in srcDistExtensionMap)) {
		throw new RangeError(
			`不支持的文件扩展名：${extension}，仅支持${Object.keys(srcDistExtensionMap).join('、')}`,
		)
	}
	const builtExtension = srcDistExtensionMap[extension as keyof typeof srcDistExtensionMap]
	return { baseName, extension, builtExtension }
}
