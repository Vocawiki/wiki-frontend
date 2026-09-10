import { readdir } from 'node:fs/promises'

import pMap, { type MaybePromise } from 'p-map'
import type { Arrayable } from 'type-fest'

/**
 * 寻找`baseDir`下的入口，文件夹名称含括号的为分类，可以有任意层。
 *
 * @example
 * await findCodeEntries('src/gadgets')
 * [
 *   { name: 'gadget-1', path: 'src/gadgets/gadget-1' },
 *   { name: 'gadget-2', path: 'src/gadgets/(style)/gadget-2' },
 *   { name: 'gadget-3', path: 'src/gadgets/(style)/gadget-3' },
 *   { name: 'gadget-4', path: 'src/gadgets/(lib)/gadget-4' },
 * ]
 */
export async function findCodeEntries(baseDir: string): Promise<{ name: string; path: string }[]> {
	const entries = await readdir(baseDir, { withFileTypes: true })
	const result = await pMap(
		entries.filter((x) => x.isDirectory()),
		({ name }): MaybePromise<Arrayable<{ name: string; path: string }>> => {
			// 为了在构建产物中展示代码仓库中的源代码链接，这里不使用平台的分隔符
			const subdir = `${baseDir}/${name}`
			if (/^\(.+\)$/.test(name)) {
				return findCodeEntries(subdir)
			}
			return { name, path: subdir }
		},
	)
	return result.flat()
}
