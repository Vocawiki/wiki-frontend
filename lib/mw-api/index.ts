import { shake } from 'radashi'

type OneOrMoreValue<T> = T | [T, ...T[]]

const mwApiQueryProps = {
	imageinfo: {
		prefix: 'ii',
	},
	extracts: {
		prefix: 'ex',
	},
	pageimages: {
		prefix: 'pi',
	},
} as const

type MwQueryProp = keyof typeof mwApiQueryProps
interface MwQueryPropParams {
	extracts: {
		chars?: number
		intro?: boolean
		plaintext?: boolean
		limit?: 'max'
	}
	imageinfo: {
		prop?: OneOrMoreValue<'dimensions' | 'url'>
		urlwidth?: number
		urlheight?: number
	}
	pageimages: {
		prop: OneOrMoreValue<'thumbnail'>
		thumbsize?: number
		license?: 'any'
		limit?: 'max'
	}
}

function solveApiValue(value: unknown): string | undefined {
	// 不要把这个双等号改成三等号
	if (value == null) {
		return undefined
	}

	if (Array.isArray(value)) {
		return value.map((x) => solveApiValue(x)).join('|')
	}
	if (typeof value === 'boolean') {
		return value ? '1' : undefined
	}
	if (typeof value === 'object') {
		throw new Error('MwApiCall参数不应出现对象')
	}
	// eslint-disable-next-line @typescript-eslint/no-base-to-string
	return String(value)
}

export class MwApiCall<
	Params extends {
		[Prop in MwQueryProp]?: MwQueryPropParams[Prop]
	},
> {
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	lastContinue: {} = {}
	finished = false
	titles: string[]
	params: Params

	constructor(params: { titles: string[] } & Params) {
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

		const data = (await (
			await fetch(
				'https://voca.wiki/api.php?' +
					new URLSearchParams(
						shake({
							...solvedParams,
							...this.lastContinue,
							action: 'query',
							format: 'json',
							formatversion: '2',
							titles: solveApiValue(this.titles),
							prop: solveApiValue(props),
						}),
					).toString(),
			)
		).json()) as {
			batchcomplete?: boolean
			continue?: unknown
			query: {
				pages: { pageid: number; ns: number; title: string }[]
			}
		}

		yield data.query.pages as ({
			pageid: number
			ns: number
			title: string
		} & T)[]

		if (!data.continue) {
			this.finished = true
			return
		}

		this.lastContinue = data.continue
		yield* this.query()
	}
}
