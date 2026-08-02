const referencedFiles = new Set<string>()

export function referenceFile(normalizedFileName: string): void {
	referencedFiles.add(normalizedFileName)
}

export function getReferencedFiles(): Set<string> {
	return referencedFiles
}
