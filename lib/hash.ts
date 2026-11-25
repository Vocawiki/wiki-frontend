export type DigestAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export async function stringHash(
	content: string,
	options: {
		alphabet: 'base64' | 'base64url' | 'hex'
		lengthInString: number
		algorithm?: DigestAlgorithm
	},
): Promise<string> {
	const { alphabet, lengthInString, algorithm = 'SHA-256' } = options
	const bytes = new TextEncoder().encode(content)
	const hashBuffer = await crypto.subtle.digest(algorithm, bytes)
	let hash: string
	if (alphabet === 'hex') {
		hash = new Uint8Array(hashBuffer.slice(0, Math.ceil(lengthInString / 2))).toHex()
	} else {
		hash = new Uint8Array(hashBuffer.slice(0, Math.ceil((lengthInString * 3) / 4))).toBase64({
			alphabet,
		})
	}
	return hash.slice(0, lengthInString)
}
