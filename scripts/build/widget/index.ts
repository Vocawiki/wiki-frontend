import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'

import { construct, crush, shake } from 'radashi'
import type { RequiredDeep } from 'type-fest'

import { writeBuiltPage } from '@/scripts/utils/page'
import { getFileInfo } from '@/tools/gadget/file'
import { defaultWidgetMeta, type WidgetMeta } from '@/tools/widget'
import { getWidgetCode } from './widget-template'

export async function buildWidgets() {
	const widgetEntries = await findEntities('src/widgets')
	await Promise.all(widgetEntries.map((entity) => buildEntity(entity)))
}

/**
 * 查找 dir 下的 index.xx 文件
 * @returns 文件名
 */
async function findIndexFile(underDir: string): Promise<string | null> {
	for (const x of await readdir(underDir, { withFileTypes: true })) {
		if (x.isFile() && getFileInfo(x.name).baseName === 'index') {
			return x.name
		}
	}
	return null
}

async function findEntities(dir: string): Promise<
	{
		name: string
		path: string
	}[]
> {
	const tasks = (await readdir(dir, { withFileTypes: true })).map(async (x) => {
		if (x.isFile()) {
			return {
				name: getFileInfo(x.name).baseName,
				path: `${x.parentPath}/${x.name}`,
			}
		}
		if (x.isDirectory()) {
			const dir = `${x.parentPath}/${x.name}`
			const indexFileName = await findIndexFile(dir)
			if (indexFileName === null) return null
			return {
				name: x.name,
				path: `${dir}/${indexFileName}`,
			}
		}
		return null
	})
	return (await Promise.all(tasks)).filter((x) => x !== null)
}

async function buildEntity({ name, path }: { name: string; path: string }) {
	assert.match(path, /^src\//, '必须使用“src/”开头的路径')
	assert(isValidWidgetName(name), '不支持的widget名：' + name)

	const inputtedMeta = ((await import(`@/src/widgets/${name}/(meta)`)) as { default: WidgetMeta }).default

	const meta = construct({
		...crush(defaultWidgetMeta),
		...shake(crush(inputtedMeta)),
	}) as RequiredDeep<WidgetMeta>

	const tempDir = 'widgets'

	const outdir = `out/temp/${tempDir}`
	const fileName = `${name}.js`
	const result = await Bun.build({
		entrypoints: [path],
		format: 'esm',
		outdir: outdir,
		target: 'browser',
		naming: fileName,
		minify: meta.buildOptions.minify,
	})
	assert(result.success, `构建${path}失败`)

	const widgetContent = getWidgetCode({
		name,
		srcPath: path,
		script: await Bun.file(`${outdir}/${fileName}`).text(),
		meta,
	})
	await writeBuiltPage(`Widget:${name}`, widgetContent)
}

function isValidWidgetName(name: string): boolean {
	return /^[a-zA-Z]\w*$/.test(name)
}
