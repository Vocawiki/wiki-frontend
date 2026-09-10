/**
 * Create a Worker that serves static assets
 *
 * Docs:
 * - https://developers.cloudflare.com/workers/static-assets/direct-upload
 */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import Cloudflare, { type Uploadable } from 'cloudflare'
import { globby } from 'globby'
import pMap from 'p-map'
import { objectify, pick } from 'radashi'

import type { Base64String } from '@/lib/string'

import { ASSETS_DIR } from '../../config'
import { cfDeployConfig as config } from '../config'
import { assetsStateSchema, type AssetsState } from '../types'
import * as headerFile from './header-file'
import type { CfAssetManifest, CfManifestFileInfo, CfUploadPayload } from './types'
import {
	getFilesWillBeObsoleteAfterDeploy,
	fetchObsoleteFile,
	getCfFileHash,
	getMimeFromExtension,
} from './utils'

export async function deployWorker({
	client,
	previousAssetsState,
}: {
	client: Cloudflare
	previousAssetsState: AssetsState
}): Promise<AssetsState> {
	console.log('🚀 Starting Worker creation and deployment with static assets...')
	console.log(`📁 Assets directory: ${ASSETS_DIR}`)

	console.log('📝 Creating asset manifest...')
	const { cfManifest, hashToFileInfo, newAssetsState } = await createCfManifest(ASSETS_DIR, {
		previousAssetsState,
	})

	let worker
	try {
		worker = await client.workers.beta.workers.get(config.workerName, {
			account_id: config.accountId,
		})
		console.log(`♻️  Worker ${config.workerName} already exists. Using it.`)
	} catch (error) {
		if (!(error instanceof Cloudflare.NotFoundError)) {
			throw error
		}
		console.log(`✏️  Creating Worker ${config.workerName}...`)
		worker = await client.workers.beta.workers.create({
			account_id: config.accountId,
			name: config.workerName,
			subdomain: {
				enabled: config.subdomain !== undefined,
			},
			observability: {
				enabled: true,
			},
		})
	}

	console.log(`⚙️  Worker id: ${worker.id}`)
	console.log('🔄 Starting asset upload session...')

	const uploadResponse = await client.workers.scripts.assets.upload.create(config.workerName, {
		account_id: config.accountId,
		manifest: cfManifest,
	})

	const { buckets, jwt: uploadJwt } = uploadResponse

	if (!(uploadJwt && buckets)) {
		throw new Error('Failed to start asset upload session')
	}

	let completionJwt: string

	if (buckets.length === 0) {
		console.log('✅ No new assets to upload!')
		// Use the initial upload JWT as completion JWT when no uploads are needed
		completionJwt = uploadJwt
	} else {
		const payloadsGenerator = generateUploadPayloads(buckets, hashToFileInfo)

		completionJwt = await uploadAssets(client, payloadsGenerator, {
			totalPayloads: buckets.length,
			uploadJwt,
			accountId: config.accountId,
		})
	}

	console.log('✏️  Creating Worker version...')

	// Create a new version with assets
	const version = await client.workers.beta.workers.versions.create(worker.id, {
		account_id: config.accountId,
		compatibility_date: config.compatibilityDate,
		assets: {
			jwt: completionJwt,
		},
	})

	console.log('🚚 Creating Worker deployment...')

	// Create a deployment and point all traffic to the version we created
	await client.workers.scripts.deployments.create(config.workerName, {
		account_id: config.accountId,
		strategy: 'percentage',
		versions: [
			{
				percentage: 100,
				version_id: version.id,
			},
		],
	})

	console.log('✅ Deployment successful!')
	return newAssetsState
}

function errorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message
	}
	return String(error)
}

type HashToFileInfoMapValue =
	| { type: 'active'; localPath: string; mime: string }
	| { type: 'obsolete'; path: string }
	| { type: '_headers'; base64: string }
type HashToFileInfoMap = Map<string, HashToFileInfoMapValue>

/**
 * Recursively reads all files from a directory and creates a manifest
 * mapping file paths to their hash and size.
 */
async function createCfManifest(
	rootDir: string,
	{
		previousAssetsState,
	}: {
		previousAssetsState: AssetsState
	},
): Promise<{
	cfManifest: CfAssetManifest
	hashToFileInfo: HashToFileInfoMap
	newAssetsState: AssetsState
}> {
	const relativeFilePaths = await globby('**', { cwd: rootDir })
	if (relativeFilePaths.length === 0) {
		throw new Error(`No files found in assets directory: ${rootDir}`)
	}

	const hashToFileInfo = new Map<string, HashToFileInfoMapValue>()
	hashToFileInfo.set(headerFile.hash, { type: '_headers', base64: headerFile.base64 })

	// 正在使用的文件
	const activeFiles = await pMap(
		relativeFilePaths,
		async (relativePath) => {
			const localPath = path.join(rootDir, relativePath)
			const content = await readFile(localPath)
			const extension = path.extname(relativePath).slice(1)
			const hash = await getCfFileHash(content.toBase64() as Base64String, extension)
			const mime = getMimeFromExtension(extension)

			hashToFileInfo.set(hash, { type: 'active', localPath, mime })
			return {
				path: `/${relativePath}`,
				hash,
				size: content.length,
				localPath,
				mime,
			}
		},
		{ concurrency: 4 },
	)

	// 过时文件
	const obsoleteAssets = getFilesWillBeObsoleteAfterDeploy(
		previousAssetsState,
		Iterator.from(activeFiles).map((x) => x.path),
	)
	obsoleteAssets.forEach(({ hash, path }) => hashToFileInfo.set(hash, { type: 'obsolete', path }))

	const getPath = <T extends { path: string }>(x: T) => x.path
	const cfManifest: CfAssetManifest = objectify<
		{ path: string; hash: string; size: number },
		string,
		CfManifestFileInfo
	>(
		[
			...obsoleteAssets,
			...activeFiles,
			{ path: headerFile.path, hash: headerFile.hash, size: headerFile.size },
		],
		getPath,
		(x) => pick(x, ['hash', 'size']),
	)
	// 检查
	{
		const activeFileCount = activeFiles.length
		const obsoleteFileCount = obsoleteAssets.length
		const headerFileCount = 1
		const supposedTotalCount = activeFileCount + obsoleteFileCount + headerFileCount
		assert.equal(
			Object.keys(cfManifest).length,
			supposedTotalCount,
			'Cloudflare manifest的文件个数不正确',
		)
		console.log(
			`Created manifest with ${supposedTotalCount} files: ${activeFileCount} active, ${obsoleteFileCount} obsolete`,
		)
	}

	const newAssetsState: AssetsState = assetsStateSchema.parse({
		active: objectify(activeFiles, getPath),
		obsolete: objectify(obsoleteAssets, getPath),
	})

	return { cfManifest, hashToFileInfo, newAssetsState }
}

/**
 * Creates upload payloads from buckets and manifest
 */
async function generateUploadPayload(
	bucket: string[],
	hashToFileInfo: HashToFileInfoMap,
): Promise<CfUploadPayload> {
	async function getPayloadByHash(hash: string): Promise<Uploadable> {
		const info = hashToFileInfo.get(hash)
		assert(info, `未找到此hash对应的文件：${hash}`)

		switch (info.type) {
			case 'active': {
				console.log(`从本地加载：${info.localPath}`)
				const fileContent = await readFile(info.localPath)
				const base64 = fileContent.toBase64()
				return new File([base64], path.basename(info.localPath), { type: info.mime })
			}
			case 'obsolete': {
				console.log(`从远程加载：${info.path}`)
				const { base64, mime } = await fetchObsoleteFile(info.path)
				const calculatedHash = await getCfFileHash(base64, path.extname(info.path).slice(1))
				assert(calculatedHash === hash, `远程 ${info.path} 的hash与记载的不一致`)
				return new File([base64], path.basename(info.path), { type: mime })
			}
			case '_headers': {
				return new File([info.base64], '_headers')
			}
		}
	}
	const payload: CfUploadPayload = Object.fromEntries(
		await pMap(bucket, async (hash) => [hash, await getPayloadByHash(hash)], { concurrency: 4 }),
	)
	return payload
}

async function* generateUploadPayloads(
	buckets: string[][],
	hashToFileInfo: HashToFileInfoMap,
): AsyncGenerator<CfUploadPayload> {
	for (const bucket of buckets) {
		yield generateUploadPayload(bucket, hashToFileInfo)
	}
}

async function uploadPayload(
	payload: CfUploadPayload,
	{
		client,
		accountId,
		uploadJwt,
		onCompletionJwtReceived,
	}: {
		client: Cloudflare
		accountId: string
		uploadJwt: string
		onCompletionJwtReceived: (jwt: string) => void
	},
) {
	const response = await client.workers.assets.upload.create(
		{
			account_id: accountId,
			base64: true,
			// @ts-expect-error SB Cloudflare标错类型了
			body: payload,
		},
		{
			headers: { Authorization: `Bearer ${uploadJwt}` },
		},
	)

	if (response?.jwt) {
		onCompletionJwtReceived(response.jwt)
	}
}

async function uploadAssets(
	client: Cloudflare,
	payloads: AsyncIterable<CfUploadPayload>,
	{
		totalPayloads,
		uploadJwt,
		accountId,
	}: { totalPayloads: number; uploadJwt: string; accountId: string },
): Promise<string> {
	console.log(`Uploading ${totalPayloads} payload(s)...`)

	let completionJwt: string | undefined
	let i = 1
	for await (const payload of payloads) {
		console.log(`Uploading payload ${i}/${totalPayloads}...`)

		try {
			await uploadPayload(payload, {
				client,
				accountId,
				uploadJwt,
				onCompletionJwtReceived: (jwt) => {
					completionJwt = jwt
				},
			})
		} catch (error) {
			throw new Error(`Failed to upload payload ${i + 1}: ${errorMessage(error)}`, { cause: error })
		}

		i++
	}

	if (!completionJwt) {
		throw new Error('Upload completed but no completion JWT received')
	}

	console.log('✅ All assets uploaded successfully')
	return completionJwt
}
