import * as z from 'zod'

const isoDatetimeToDate = z.codec(z.iso.datetime(), z.date(), {
	decode: (isoString) => new Date(isoString),
	encode: (date) => date.toISOString(),
})

export const deploymentStateSchema = z.object({
	version: z.literal(1),
	pages: z.record(z.string(), z.string()).meta({
		title: '已部署页面',
		description: '已部署页面的标题到其对应内容 SHA 的映射',
	}),
	commitSHA: z.string().min(1),
	runId: z
		.string()
		.min(1)
		.optional()
		.meta({ title: 'GitHub Actions Run ID', description: '可选，如果为空则代表手动部署' }),
	deployStartedAt: isoDatetimeToDate,
	deployFinishedAt: isoDatetimeToDate,
})

export type DeploymentStateStorage = z.input<typeof deploymentStateSchema>
export type DeploymentState = z.output<typeof deploymentStateSchema>
