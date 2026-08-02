import * as z from 'zod'

import { isoDatetimeToDate, isoDatetimeToInstant } from '@/lib/zod'

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

export const deploymentStateSchemaV1 = z.object({
	version: z.literal(1),
	pages: deploymentPagesSchema,
	commitSHA: commitShaSchema,
	runId: runIdSchema,
	deployStartedAt: isoDatetimeToDate,
	deployFinishedAt: isoDatetimeToDate,
})

const referencedFilesSchema = z.codec(z.array(z.string()), z.set(z.string()), {
	decode: (array) => new Set(array),
	encode: (set) => [...set].toSorted(compareTitle),
})

export const deploymentStateSchemaV2 = z.object({
	version: z.literal(2),
	lockedBy: z.string().min(1).optional().meta({ title: '占用者', description: '一般是Run ID' }),
	pages: deploymentPagesSchema,
	referencedFiles: referencedFilesSchema,
	trash: deploymentTrashSchema,
	commitSha: commitShaSchema,
	runId: runIdSchema,
	deployStartedAt: isoDatetimeToInstant,
	deployFinishedAt: isoDatetimeToInstant,
	cleanFinishedAt: isoDatetimeToInstant,
})

export type DeploymentStateStorageV1 = z.input<typeof deploymentStateSchemaV1>
export type DeploymentStateStorageV2 = z.input<typeof deploymentStateSchemaV2>
export type DeploymentStateV1 = z.output<typeof deploymentStateSchemaV1>
export type DeploymentStateV2 = z.output<typeof deploymentStateSchemaV2>
