import * as z from 'zod'

export const DEPLOYMENT_STATE_PAGE_TITLE = 'MediaWiki:Deployment.json'

const cfWorkerDeployConfigSchema = z.object({
	accountId: z.string().min(1),
	apiToken: z.string().min(1),
	workerName: z.string().min(1),
	compatibilityDate: z.iso.date(),
	subdomain: z.string().min(1).optional(),
})

const env = process.env
export const cfDeployConfig = cfWorkerDeployConfigSchema.parse({
	accountId: env.CF_ACCOUNT_ID,
	apiToken: env.CF_API_TOKEN,
	workerName: env.CF_WORKER_NAME ?? 'assets',
	compatibilityDate: env.CF_WORKER_COMPATIBILITY_DATE ?? '2026-09-09',
	subdomain: env.CF_WORKER_SUBDOMAIN ?? undefined,
})
