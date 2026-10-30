import { objectify as _objectify } from 'radashi'
import type { IsEqual, If, OrAll } from 'type-fest'

// Radashi到底懂不懂开发体验啊？
export const objectify = _objectify as <T, Key extends string | number | symbol, Value = T>(
	array: readonly T[],
	getKey: (item: T, index: number) => Key,
	getValue?: (item: T, index: number) => Value,
) => If<
	OrAll<[IsEqual<Key, string>, IsEqual<Key, number>, IsEqual<Key, symbol>]>,
	Record<Key, Value>,
	Partial<Record<Key, Value>>
>
