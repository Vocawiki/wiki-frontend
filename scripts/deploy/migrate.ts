import type { DeploymentStateStorageV1, DeploymentStateStorageV2 } from './types'

export function migrateFromV1ToV2(v1: DeploymentStateStorageV1): DeploymentStateStorageV2 {
	return {
		version: 2,
		pages: v1.pages,
		referencedFiles: [],
		trash: {},
		commitSha: v1.commitSHA,
		runId: v1.runId,
		deployStartedAt: v1.deployStartedAt,
		deployFinishedAt: v1.deployFinishedAt,
		cleanFinishedAt: v1.deployFinishedAt,
	}
}
