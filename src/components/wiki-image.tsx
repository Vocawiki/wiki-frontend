import { Md5 } from 'ts-md5'

import { normalizeWikiTitle, withBaseURL } from '@/lib/wiki'

interface WikiImageUniqueProps {
	file: string
}
export type WikiImageProps = WikiImageUniqueProps &
	Omit<React.ComponentProps<'img'>, 'src' | 'srcset'>

// TODO: 通过机器人将图片标记为正在使用
export function WikiImage({ file: fileName, alt, ...props }: WikiImageProps) {
	const src = toImageURL(fileName)
	return <img loading="lazy" {...props} alt={alt ?? fileName} src={src} />
}

// TODO: 不同分辨率的URL
function toImageURL(fileName: string): string {
	const normalizedName = normalizeWikiTitle(fileName)
	const hash = Md5.hashStr(normalizedName)
	// FIXME: 路径不应总是有域名
	const url = `/images/${hash[0]}/${hash.slice(0, 2)}/${encodeURIComponent(normalizedName)}`
	return withBaseURL(url, { absolute: true })
}
