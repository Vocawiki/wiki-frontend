import fs from 'node:fs/promises'

const referencedFiles = new Set<string>()

export function referenceFile(normalizedFileName: string): void {
	referencedFiles.add(normalizedFileName)
}

export function getReferencedFiles(): Set<string> {
	return referencedFiles
}

export async function saveReferencedFiles(): Promise<void> {
	const content = Array.from(referencedFiles).join('\n')
	await fs.writeFile('out/referenced-files.txt', content, 'utf-8')
}

export async function loadReferencedFiles(): Promise<Set<string>> {
	const content = await fs.readFile('out/referenced-files.txt', 'utf-8')
	const lines = content.trim().split('\n')
	for (const line of lines) {
		referencedFiles.add(line)
	}
	return referencedFiles
}
