import { join } from 'node:path'

import { outputFile, pathExists, readJson, remove } from 'fs-extra/esm'
import * as z from 'zod'

import { WIKI_STYLES_CACHE_TTL } from '@/lib/config'
import { withBaseURL } from '@/lib/wiki'
import { isoDatetimeToInstant } from '@/lib/zod'

const softwareStylesURL = withBaseURL(
	'/load.php?lang=zh-cn&modules=skins.citizen.codex.styles%7Cskins.citizen.icons%2Cstyles%2Ctokens&only=styles&skin=citizen',
)
// TODO: 默认启用的gadget也需要把样式囊括进去

const cacheMetaSchema = z.object({
	version: z.literal(1),
	fetchedAt: isoDatetimeToInstant,
})

type CacheMeta = z.output<typeof cacheMetaSchema>

const cacheDir = join(import.meta.dirname, 'site', '.cache')
const cacheMetaPath = join(cacheDir, 'meta.json')
const cssPath = join(cacheDir, 'software.css')

const cacheMeta = await getCacheMeta()
if (!cacheMeta) {
	await fetchStyles({ isRefreshing: false })
} else if (isCacheStale(cacheMeta)) {
	await fetchStyles({ isRefreshing: true })
} else {
	console.log('使用缓存中的网站样式')
}

// 后面都是函数了

async function getCacheMeta(): Promise<CacheMeta | null> {
	if (!(await pathExists(cacheMetaPath))) return null

	try {
		const rawMeta = (await readJson(cacheMetaPath)) as unknown
		const meta = cacheMetaSchema.parse(rawMeta)
		return meta
	} catch (e) {
		console.error('解析cache meta时发生错误：', e)
		await remove(cacheMetaPath)
		return null
	}
}

function isCacheStale(cacheMeta: CacheMeta): boolean {
	const now = Temporal.Now.instant()
	return Temporal.Duration.compare(now.since(cacheMeta.fetchedAt), WIKI_STYLES_CACHE_TTL) > 0
}

async function fetchStyles({ isRefreshing }: { isRefreshing: boolean }) {
	console.log(`正在${isRefreshing ? '重新' : ''}下载网站样式……`)
	const now = Temporal.Now.instant()
	const meta = JSON.stringify(cacheMetaSchema.encode({ version: 1, fetchedAt: now }))

	try {
		const response = await fetch(softwareStylesURL)
		if (!response.ok) {
			throw new Error(`请求失败（${response.status}）`)
		}
		const contentType = response.headers.get('Content-Type')
		if (!(contentType && /^text\/css($|;)/u.test(contentType))) {
			throw new Error(`Content-Type为“${contentType}”，并非“text/css”`)
		}
		const css = await response.text()
		await outputFile(cssPath, css)
		await outputFile(cacheMetaPath, meta)
		console.log(`网站样式已${isRefreshing ? '更新' : '下载'}`)
	} catch (e) {
		if (!isRefreshing) {
			const message = `网站样式下载失败，请手动创建以下文件：
1. ${cacheMetaPath}
\`\`\`json
${meta}
\`\`\`
2. ${cssPath}
从 ${softwareStylesURL} 下载。`
			throw new Error(message, {
				cause: e,
			})
		}
		console.error('网站样式下载失败，使用缓存中的样式。错误如下：', e)
	}
}
