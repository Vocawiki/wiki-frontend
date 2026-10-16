// throw new Error('暂无迁移逻辑')

import { mapValues } from 'radashi'

import { type DeploymentState, deploymentStateSchema, deploymentStateSchemaV3 } from './types'

export function parseDeploymentStateString(raw: string): DeploymentState {
	const parsed = JSON.parse(raw) as unknown
	return parseDeploymentState(parsed)
}

const migrations: Record<number, (oldRaw: unknown) => DeploymentState> = {
	3: (oldRaw): DeploymentState => {
		const old = deploymentStateSchemaV3.parse(oldRaw)
		return {
			...old,
			version: 4,
			pages: mapValues(old.pages, (hash) => ({ hash })),
		}
	},
}

function parseDeploymentState(raw: unknown): DeploymentState {
	if (
		!(
			typeof raw === 'object' &&
			raw !== null &&
			'version' in raw &&
			typeof raw.version === 'number'
		)
	) {
		throw new Error(`不支持的部署状态格式：${JSON.stringify(raw)}`)
	}

	if (raw.version === 4) {
		return deploymentStateSchema.parse(raw)
	}

	const migrate = migrations[raw.version]
	if (migrate) {
		return migrate(raw)
	}

	throw new Error(`不支持的部署状态版本：${raw.version as any}`)
}
