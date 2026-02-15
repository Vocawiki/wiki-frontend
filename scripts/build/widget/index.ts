import assert from 'node:assert/strict'
import { readdir } from 'node:fs/promises'

import { rolldown, type RolldownBuild } from 'rolldown'

import { writeBuiltPage } from '@/scripts/utils/page'
import { getFileInfo } from '@/tools/gadget/file'
import type { WidgetMeta } from '@/tools/widget'

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

	const meta = ((await import(`@/src/widgets/${name}/(meta)`)) as { default: WidgetMeta }).default

	let bundle: RolldownBuild | undefined
	try {
		bundle = await rolldown({
			input: path,
			tsconfig: 'src/tsconfig.json',
			transform: {
				target: [
					'edge79', // Edge换用Chromium后的第一个版本
					'chrome109', // 最后一个支持Windows 7的Chrome版本
				],
			},
			treeshake: true,
			platform: 'browser',
		})

		const outputOptions = meta.buildOptions ?? {}
		outputOptions.minify ??= true
		const { output } = await bundle.generate(outputOptions)
		assert.equal(output.length, 1, '应当只有一个chunk生成')

		const widgetContent = getWidgetCode({
			name,
			srcPath: path,
			script: output[0].code,
			meta,
		})
		await writeBuiltPage(`Widget:${name}`, widgetContent)
	} finally {
		await bundle?.close()
	}
}

function isValidWidgetName(name: string): boolean {
	return /^[a-zA-Z]\w*$/.test(name)
}
