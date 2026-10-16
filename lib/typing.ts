export type Expect<T extends true> = T

// TODO: type-fest新版上线后删除
// 来自 https://github.com/sindresorhus/type-fest/blob/main/source/entry.d.ts，CC0
export type ObjectEntry<BaseType extends object> = [BaseType] extends [never]
	? never
	: {
			[Key in Exclude<keyof BaseType, symbol>]: [(Key & string) | `${Key & number}`, BaseType[Key]]
		}[Exclude<keyof BaseType, symbol>]
export type ObjectEntries<BaseType extends object> = ObjectEntry<BaseType>[]
