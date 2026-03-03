export interface WikitextImageProps {
	file: string
	width?: number
	height?: number
	link?: string | false
	alt?: string
	className?: string
}

export function WikitextImage({ file, width, height, link, alt, className }: WikitextImageProps) {
	let size: string | undefined = ''
	if (width) {
		size += width.toString()
	}
	if (height) {
		size += `x${height}`
	}
	if (size) {
		size += 'px'
	} else {
		size = undefined
	}

	const args = [
		size,
		link === undefined ? undefined : `link=${link || ''}`,
		alt === undefined ? undefined : `alt=${alt}`,
		className === undefined ? undefined : `class=${className}`,
	]
		.filter((x) => x !== undefined)
		.join('|')

	return `[[File:${file}${args ? `|${args}` : ''}]]`
}
