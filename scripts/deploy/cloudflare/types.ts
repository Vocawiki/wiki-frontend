import type { Uploadable } from 'cloudflare'

export interface CfManifestFileInfo {
	hash: string
	size: number
}

export interface CfAssetManifest {
	[path: string]: CfManifestFileInfo
}

export interface CfUploadPayload {
	[hash: string]: Uploadable
}
