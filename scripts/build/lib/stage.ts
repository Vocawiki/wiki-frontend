import type { Promisable } from 'type-fest'

export class Stage<Input, Output> {
	private readonly predecessorTasks: Promise<unknown>[] = []
	private _status: 'pending' | 'running' | 'finished' = 'pending'
	private readonly promiseWithResolvers = Promise.withResolvers<Output>()
	private readonly runner
	readonly promise = this.promiseWithResolvers.promise

	constructor(runner: (input: Input) => Promisable<Output>) {
		this.runner = runner
	}

	get status() {
		return this._status
	}

	registerPredecessorTask(taskPromise: Promise<unknown>) {
		this.predecessorTasks.push(taskPromise)
	}

	async run(...input: Input extends undefined ? [undefined?] : [Input]) {
		const inputValue = input[0] as Input
		await Promise.all(this.predecessorTasks)
		this._status = 'running'
		const output = await this.runner(inputValue)
		this.promiseWithResolvers.resolve(output)
		this._status = 'finished'
	}
}
export type StageInput<TStage> = TStage extends Stage<infer Input, any> ? Input : never
export type StageOutput<TStage> = TStage extends Stage<any, infer Output> ? Output : never
