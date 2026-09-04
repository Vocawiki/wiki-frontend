import { join } from 'node:path'

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

const thisFileDir = import.meta.dirname
const cacheDir = join(thisFileDir, 'site', '.cache')
const cacheMetaFile = Bun.file(join(cacheDir, 'meta.json'))

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
	if (!(await cacheMetaFile.exists())) return null

	try {
		const rawMeta = (await cacheMetaFile.json()) as unknown
		const meta = await cacheMetaSchema.parseAsync(rawMeta)
		return meta
	} catch (e) {
		console.error('解析cache meta时发生错误：', e)
		await cacheMetaFile.delete()
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
	try {
		const response = await fetch(softwareStylesURL)
		const css = await response.text()
		await Bun.file(join(cacheDir, 'software.css')).write(css)
		const meta = JSON.stringify(await cacheMetaSchema.encodeAsync({ version: 1, fetchedAt: now }))
		await cacheMetaFile.write(meta)
		console.log(`网站样式已${isRefreshing ? '更新' : '下载'}`)
	} catch (e) {
		if (!isRefreshing) throw e
		console.error('网站样式下载失败，使用缓存中的样式。错误如下：', e)
	}
}
