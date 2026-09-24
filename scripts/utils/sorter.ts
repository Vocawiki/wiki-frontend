// eslint-disable-next-line @typescript-eslint/unbound-method
const compareTitle = new Intl.Collator('zh-Hans-CN', { numeric: true }).compare

export function comparePath(pathA: string, pathB: string): number {
	const partsA = splitPathForCompare(pathA)
	const partsB = splitPathForCompare(pathB)
	const minLength = Math.min(partsA.length, partsB.length)
	for (let i = 0; i < minLength; i++) {
		const partA = partsA[i]!
		const partB = partsB[i]!
		const result = compareTitle(partA, partB)
		if (result !== 0) {
			return result
		}
	}
	return partsA.length - partsB.length
}

/**
 * @example
 * splitPathForCompare('a/b-c.d') === ['a', '/', 'b', '-', 'c', '.', 'd']
 */
function splitPathForCompare(path: string): string[] {
	return path.split(/([/\\:\-_.])/g)
}
