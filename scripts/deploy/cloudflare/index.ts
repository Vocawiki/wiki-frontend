import Cloudflare from 'cloudflare'

import { cfDeployConfig } from '../config'
import type { AssetsState, DeploymentContext, DeploymentState } from '../types'
import { deployWorker } from './worker-deloy'

export async function deployCloudflareWorker(
	_ctx: DeploymentContext,
	previousDeploymentState: DeploymentState,
): Promise<AssetsState> {
	const client = new Cloudflare({ apiToken: cfDeployConfig.apiToken })
	const newAssetsState = await deployWorker({
		client,
		previousAssetsState: previousDeploymentState.assets,
	})
	return newAssetsState
}
