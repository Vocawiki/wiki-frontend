import assert from 'node:assert/strict'

import type { Arrayable, IsEqual, Promisable } from 'type-fest'

import type { Expect } from '@/lib/typing'

import type { ContentModel } from '../../types'
import type { ScriptBuildEntry } from '../types'
import type { Stage, StageOutput } from './stage'

export interface BuildStagesBase {
	start: Stage<any, any>
	end: Stage<any, any>
	[key: string]: Stage<any, any>
}

export class BuildContext<const Stages extends BuildStagesBase> {
	protected readonly scriptEntries: ScriptBuildEntry[] = []
	protected readonly nondefaultContentModels = new Map<string, ContentModel>()
	protected hasStoppedCollectingScriptEntries = false
	protected hasStoppedCollectingContentModels = false
	private readonly mwPageNames = new Set<string>()
	private readonly assetNames = new Set<string>()
	private readonly stages: Stages

	constructor(stages: Stages) {
		this.stages = stages
	}

	scheduleTask<T, AfterStage extends keyof Stages>(
		func: (input: StageOutput<Stages[AfterStage]>) => Promisable<T>,
		timing: {
			after: AfterStage
			before: Arrayable<keyof Stages>
		} = {
			after: 'start' as AfterStage,
			before: ['end'],
		},
	): { done: Promise<T> } {
		const afterName = timing.after
		const beforeNames: (keyof Stages)[] = Array.isArray(timing.before) ? timing.before : ['end']
		const afterStage = this.stages[afterName] as Stages[AfterStage]
		const beforeStages = beforeNames.map((name) => {
			const stage = this.stages[name]!
			if (stage.status !== 'pending') {
				throw new Error(
					`阶段${name as string}已${stage.status === 'running' ? `开始` : `结束`}，不可再添加任务`,
				)
			}
			return stage
		})

		const taskPromise = afterStage.promise.then(func)
		beforeStages.forEach((stage) => stage.registerPredecessorTask(taskPromise))
		return { done: taskPromise }
	}

	registerScriptEntry(entry: ScriptBuildEntry): void {
		assert(!this.hasStoppedCollectingScriptEntries, '已停止收集script entry')

		if (entry.type === 'mw-page') {
			const title = entry.title
			assert(!this.mwPageNames.has(title), `出现了重名的MediaWiki页面：${title}`)
			this.mwPageNames.add(title)
		} else {
			type _Check = Expect<IsEqual<typeof entry.type, 'asset'>>
			const name = entry.name
			assert(!this.assetNames.has(name), `出现了重名的asset：${name}`)
			this.assetNames.add(name)
		}
		this.scriptEntries.push(entry)
	}

	registerNondefaultContentModel(title: string, contentModel: ContentModel): void {
		assert(!this.hasStoppedCollectingContentModels, '已停止收集content model')

		this.nondefaultContentModels.set(title, contentModel)
	}
}

export class BuildContextForScheduler<
	const Stages extends BuildStagesBase,
> extends BuildContext<Stages> {
	collectFinialScriptEntries() {
		this.hasStoppedCollectingScriptEntries = true
		return this.scriptEntries
	}

	collectFinialNondefaultContentModels() {
		this.hasStoppedCollectingContentModels = true
		return this.nondefaultContentModels
	}
}
