import fs from 'node:fs/promises'

import { REFERENCED_FILES_PATH } from '@/scripts/config'

const referencedFiles = new Set<string>()

export function referenceFile(normalizedFileName: string): void {
	referencedFiles.add(normalizedFileName)
}

export function getReferencedFiles(): Set<string> {
	return referencedFiles
}

export async function saveReferencedFiles(): Promise<void> {
	const content = [...referencedFiles].join('\n')
	await fs.writeFile(REFERENCED_FILES_PATH, content, 'utf-8')
}

export async function loadReferencedFiles(): Promise<Set<string>> {
	const content = await fs.readFile(REFERENCED_FILES_PATH, 'utf-8')
	const lines = content.trim().split('\n')
	for (const line of lines) {
		referencedFiles.add(line)
	}
	return referencedFiles
}
