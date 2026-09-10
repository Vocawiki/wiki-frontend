import * as z from 'zod'

import { isoDatetimeToInstant } from '@/lib/zod'

import { compareTitle } from './sorter'

export interface DeploymentContext {
	summary: string
	commitSha: string
	runId: string | undefined
}

export interface Page {
	title: string
	content: string
	sha1: string
}

const deploymentPagesSchema = z.record(z.string(), z.string()).meta({
	title: '已部署页面',
	description: '已部署页面的标题到其对应内容SHA的映射',
})

const commitShaSchema = z.string().min(1)

const runIdSchema = z
	.string()
	.min(1)
	.optional()
	.meta({ title: 'GitHub Actions Run ID', description: '可选，如果为空则代表手动部署' })

export const deploymentTrashSchema = z
	.codec(
		z.record(z.string(), isoDatetimeToInstant),
		z.map(z.string(), z.instanceof(Temporal.Instant)),
		{
			decode: (record) =>
				new Map(
					Object.entries(record).toSorted((a, b) => {
						const diff = Temporal.Instant.compare(a[1], b[1])
						if (diff !== 0) return diff
						return compareTitle(a[0], b[0])
					}),
				),
			encode: (map) => Object.fromEntries(map.entries()),
		},
	)
	.meta({ description: '从chunk名到最后使用时间' })
export type DeploymentTrash = z.infer<typeof deploymentTrashSchema>

const pathSchema = z.string().startsWith('/')
const hashAndSize = {
	hash: z.string().meta({ title: '文件hash' }),
	size: z.number().int().nonnegative().meta({ title: '文件大小' }),
} as const

export const assetsStateSchema = z.object({
	active: z.record(pathSchema.meta({ title: '文件路径' }), z.object(hashAndSize)),
	obsolete: z.record(
		pathSchema.meta({ title: '文件路径' }),
		z.object({
			...hashAndSize,
			lastUsed: isoDatetimeToInstant.meta({ title: '最后使用时间' }),
		}),
	),
})
export type AssetsState = z.output<typeof assetsStateSchema>

const referencedFilesSchema = z.codec(z.array(z.string()), z.set(z.string()), {
	decode: (array) => new Set(array),
	encode: (set) => [...set].toSorted(compareTitle),
})

export const deploymentStateSchema = z.object({
	version: z.literal(3),
	lockedBy: z.string().min(1).optional().meta({ title: '占用者', description: '一般是Run ID' }),
	pages: deploymentPagesSchema,
	assets: assetsStateSchema,
	referencedFiles: referencedFilesSchema,
	trash: deploymentTrashSchema,
	commitSha: commitShaSchema,
	runId: runIdSchema,
	deployStartedAt: isoDatetimeToInstant,
	workerDeployFinishedAt: isoDatetimeToInstant,
	deployFinishedAt: isoDatetimeToInstant,
	cleanFinishedAt: isoDatetimeToInstant,
})

export type DeploymentState = z.output<typeof deploymentStateSchema>
