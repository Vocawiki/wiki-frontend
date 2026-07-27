export function cleanLocalStorage() {
	const keysToRemove: string[] = []

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i)!
		if (isUseless(key)) {
			keysToRemove.push(key)
		}
	}

	keysToRemove.forEach((key) => localStorage.removeItem(key))
}

function isUseless(key: string): boolean {
	return key.startsWith('RandomSong-CatsData-')
}
