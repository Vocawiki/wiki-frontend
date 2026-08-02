import { REPO_NAME } from '../config'
import type { DeploymentContext } from './types'

export function deploymentSpecifier({ runId, commitSha }: DeploymentContext): string {
	return `（版本：[[git:${REPO_NAME}/commit/${commitSha}|${commitSha.slice(0, 7)}]]${
		runId ? `；本次任务：[[git:${REPO_NAME}/actions/runs/${runId}|${runId}]]` : ''
	}）`
}
