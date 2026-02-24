import { getFileInfo, type FileInfo } from '@/scripts/utils/file-info'
import { srcDistExtensionMap, type GadgetSourceFileExtension } from '@/tools/gadget'

export interface GadgetSourceFileInfo extends FileInfo {
	extension: GadgetSourceFileExtension
	builtExtension: string
}

export function getGadgetSourceFileInfo(fileName: string): GadgetSourceFileInfo {
	const baseFileInfo = getFileInfo(fileName)
	const extension = baseFileInfo.extension
	const builtExtension = srcDistExtensionMap[extension as GadgetSourceFileExtension] as
		| string
		| undefined

	if (!builtExtension) {
		throw new RangeError(
			`不支持的文件扩展名：${extension}，仅支持${Object.keys(srcDistExtensionMap).join('、')}`,
		)
	}

	return { ...baseFileInfo, extension: extension as GadgetSourceFileExtension, builtExtension }
}
