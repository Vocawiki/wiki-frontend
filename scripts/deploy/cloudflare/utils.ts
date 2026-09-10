import type { Base64String } from '@/lib/string'

import { ASSETS_BASE_URL_WITHOUT_ROUTE_PATH } from '../../config'
import type { AssetsState } from '../types'

export async function getCfFileHash(
	fileContentBase64: Base64String,
	extension: string,
): Promise<string> {
	// 算法来自Cloudflare官方示例，我也不知道到底是不是非要这么算，
	// 还是说只要保证同样的文件算出来的hash一样就行。
	// 官方示例：
	// return crypto
	// 	.createHash('sha256')
	// 	.update(fileContentBase64 + extension)
	// 	.digest('hex')
	// 	.slice(0, 32)

	const bytes = new TextEncoder().encode(fileContentBase64 + extension)
	const hashBuffer = await crypto.subtle.digest('SHA-256', bytes)
	const hashFirst16BytesHex = new Uint8Array(hashBuffer.slice(0, 16)).toHex()
	return hashFirst16BytesHex
}

export function getFilesWillBeObsoleteAfterDeploy(
	previousState: AssetsState,
	activeFilePaths: Iterable<string>,
): ({ path: string } & AssetsState['obsolete'][any])[] {
	const now = Temporal.Now.instant()
	const earliestAllowedInstant = now.subtract({ hours: 30 * 24 })
	const obsoleteFiles = new Map<string, { path: string } & AssetsState['obsolete'][any]>()

	Object.entries(previousState.obsolete).forEach(([path, value]) => {
		const lastUsedInstant = Temporal.Instant.from(value.lastUsed)
		if (Temporal.Instant.compare(lastUsedInstant, earliestAllowedInstant) < 0) {
			return
		}
		obsoleteFiles.set(path, { path, ...value })
	})

	Object.entries(previousState.active).forEach(([path, value]) => {
		obsoleteFiles.set(path, { path, ...value, lastUsed: now })
	})

	for (const path of activeFilePaths) {
		obsoleteFiles.delete(path)
	}

	return [...obsoleteFiles.values()]
}

export async function fetchObsoleteFile(
	path: string,
): Promise<{ base64: Base64String; mime?: string }> {
	const url = `${ASSETS_BASE_URL_WITHOUT_ROUTE_PATH}${path}`
	const resp = await fetch(url)
	if (!resp.ok) {
		throw new Error(`请求 ${url} 失败，状态码：${resp.status}`)
	}
	const base64 = (await resp.bytes()).toBase64() as Base64String
	return { base64, mime: resp.headers.get('Content-Type') ?? undefined }
}

const extensionToMime: Record<string, string> = {
	// 按MIME排序
	json: 'application/json',
	map: 'application/json',
	apng: 'image/apng',
	avif: 'image/avif',
	gif: 'image/gif',
	jpeg: 'image/jpeg',
	jpg: 'image/jpeg',
	png: 'image/png',
	svg: 'image/svg+xml',
	webp: 'image/webp',
	css: 'text/css',
	html: 'text/html',
	js: 'text/javascript',
	mjs: 'text/javascript',
	md: 'text/markdown',
	txt: 'text/plain',
	woff2: 'font/woff2',
}

/**
 * @param ext 扩展名，不含“.”
 */
export function getMimeFromExtension(ext: string): string {
	const mime = extensionToMime[ext]
	if (!mime) {
		throw new Error(`不支持识别扩展名“${ext}”的MIME类型`)
	}
	return mime
}
