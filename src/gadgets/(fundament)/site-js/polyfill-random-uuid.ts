function isValidUUIDv4(uuid: unknown): boolean {
	if (typeof uuid !== 'string') return false
	return /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|0{8}-0{4}-0{4}-0{4}-0{12})$/i.test(
		uuid,
	)
}

export function polyfillRandomUUID() {
	try {
		const uuid = crypto.randomUUID()
		if (!isValidUUIDv4(uuid)) {
			throw new Error('crypto.randomUUID() is not supported')
		}
	} catch {
		const rnds8 = new Uint8Array(16)
		const rng = () => crypto.getRandomValues(rnds8)
		const byteToHex = (n: number) => n.toString(16).padStart(2, '0')

		crypto.randomUUID = () => {
			const rnds = rng()
			rnds[6] = (rnds[6]! & 0x0f) | 0x40
			rnds[8] = (rnds[8]! & 0x3f) | 0x80
			const chars = Array.from(rnds, byteToHex)

			return [
				...chars.slice(0, 4),
				'-',
				...chars.slice(4, 6),
				'-',
				...chars.slice(6, 8),
				'-',
				...chars.slice(8, 10),
				'-',
				...chars.slice(10, 16),
			].join('') as `${string}-${string}-${string}-${string}-${string}`
		}
	}
}
