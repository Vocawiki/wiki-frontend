import { srcDistExtensionMap } from './types'

export function getFileInfo(fileName: string): { baseName: string; extension: string; builtExtension: string } {
	const match = fileName.match(/^(.*)\.([^.]+)$/)
	if (!match) {
		throw new RangeError(`文件名不合法：${fileName}`)
	}
	const baseName = match[1]!
	const extension = match[2]!

	if (!(extension in srcDistExtensionMap)) {
		throw new RangeError(`不支持的文件扩展名：${extension}，仅支持${Object.keys(srcDistExtensionMap).join(', ')}`)
	}
	const builtExtension = srcDistExtensionMap[extension as keyof typeof srcDistExtensionMap]
	return { baseName, extension, builtExtension }
}
