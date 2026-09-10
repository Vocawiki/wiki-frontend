export function toSorted<K extends PropertyKey, V>(
	record: Record<K, V>,
	compareFn: (a: [K, V], b: [K, V]) => number,
): Record<K, V> {
	const entries = (Object.entries(record) as [K, V][]).sort(compareFn)
	return Object.fromEntries(entries) as Record<K, V>
}
