/**
 * 文档：
 * https://developers.cloudflare.com/workers/static-assets/headers/#custom-headers
 */

import { toBase64 } from '@/lib/string'

import { getCfFileHash } from './utils'

const headerContent = `/*
	Access-Control-Allow-Origin: https://voca.wiki
	Access-Control-Max-Age: 86400
	Cache-Control: public, max-age=31536000, immutable
`

export const path = '/_headers'
export const base64 = toBase64(headerContent)
export const hash = await getCfFileHash(base64, '')
export const size = headerContent.length
