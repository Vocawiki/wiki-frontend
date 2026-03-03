import assert from 'node:assert/strict'

import { Md5 } from 'ts-md5'

interface WikiImageUniqueProps {
	name: string
}
export type WikiImageProps = WikiImageUniqueProps &
	Omit<React.ComponentProps<'img'>, 'src' | 'srcset'>

export function WikiImage({ name: fileName, ...props }: WikiImageProps) {
	const src = toImageURL(fileName)
	return <img {...props} src={src} />
}

function normalizeWikiTitle(title: string): string {
	const s = title.replaceAll(' ', '_').replace(/^_*(.+?)_*$/, '$1')
	assert(s.length > 0, `标题为空：“${title}”`)
	const unicodeCharacters = [...s]
	unicodeCharacters[0] = unicodeCharacters[0]!.toUpperCase()
	return unicodeCharacters.join('')
}

// TODO: 不同分辨率的URL
function toImageURL(fileName: string): string {
	const normalizedName = normalizeWikiTitle(fileName)
	const hash = Md5.hashStr(normalizedName)
	const url = `/images/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(normalizedName)}`
	return url
}
