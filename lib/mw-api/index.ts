const mwApiQueryProps = {
	pageimages: {
		prefix: 'pi',
	},
	extracts: {
		prefix: 'ex',
	},
} as const

type MwQueryProp = keyof typeof mwApiQueryProps
interface MwQueryPropParams {
	pageimages: {
		prop: 'thumbnail'
		thumbsize?: number
		license?: 'any'
		limit?: 'max'
	}
	extracts: {
		chars?: number
		intro?: boolean
		plaintext?: boolean
		limit?: 'max'
	}
}

function solveApiValue(value: unknown): string | undefined {
	if (Array.isArray(value)) {
		return value.map((x) => solveApiValue(x)).join('|')
	}
	if (typeof value === 'boolean') {
		return value ? '1' : undefined
	}
	return String(value)
}

export class MwApiCall<
	Params extends {
		[Prop in MwQueryProp]?: MwQueryPropParams[Prop]
	},
> {
	protected api: mw.Api
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	lastContinue: {} | undefined = undefined
	finished = false
	titles: string[]
	params: Params

	constructor(params: { titles: string[] } & Params) {
		this.api = new mw.Api()
		this.titles = params.titles
		this.params = params
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	async *query<T extends {} = {}>(): AsyncGenerator<
		({
			pageid: number
			ns: number
			title: string
		} & T)[]
	> {
		const props: string[] = []
		const solvedParams: Record<string, string> = {}

		for (const [prop, unprefixedParams] of Object.entries(this.params)) {
			if (!(prop in mwApiQueryProps && unprefixedParams !== undefined)) {
				continue
			}

			props.push(prop)
			const prefix = mwApiQueryProps[prop as MwQueryProp].prefix

			for (const [k, v] of Object.entries(unprefixedParams)) {
				if (typeof k !== 'string') {
					continue
				}
				const solvedValue = solveApiValue(v)
				if (solvedValue === undefined) continue

				solvedParams[prefix + k] = solvedValue
			}
		}

		const data = (await this.api.get({
			...solvedParams,
			action: 'query',
			format: 'json',
			formatversion: '2',
			titles: this.titles,
			prop: props,
		})) as unknown as {
			batchcomplete?: boolean
			continue?: unknown
			query: {
				pages: { pageid: number; ns: number; title: string }[]
			}
		}

		if (data.continue) {
			this.lastContinue = data.continue
			yield* this.query()
		} else {
			yield data.query.pages as ({
				pageid: number
				ns: number
				title: string
			} & T)[]
			this.finished = true
		}
	}
}
