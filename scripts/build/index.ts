import { readdir } from 'node:fs/promises'

import { emptyDir } from 'fs-extra/esm'

import { getWidgetCode } from './widget-template'

function removeExt(fileName: string) {
	return fileName.replace(/\.[^.]+$/, '')
}

/**
 * 查找 dir 下的 index.xx 文件
 * @returns 文件名
 */
async function findIndexFile(dir: string): Promise<string | null> {
	for (const x of await readdir(dir, { withFileTypes: true })) {
		if (x.isFile() && removeExt(x.name) === 'index') {
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
	return (
		await Promise.all(
			(await readdir(dir, { withFileTypes: true })).map(async (x) => {
				if (x.isFile()) {
					return {
						name: removeExt(x.name),
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
			}),
		)
	).filter((x) => x !== null)
}

async function buildEntity({ type, name, path }: { type: 'widget' | 'gadget'; name: string; path: string }) {
	if (type !== 'widget') {
		throw new Error('未实现widget以外的构建')
	}

	const tempDir = {
		widget: 'widgets',
		gadget: 'gadgets',
	}[type]

	const outdir = `out/temp/${tempDir}`
	const fileName = `${name}.js`
	const result = await Bun.build({
		entrypoints: [path],
		format: 'esm',
		outdir: outdir,
		target: 'browser',
		naming: fileName,
		minify: {
			whitespace: true,
			identifiers: false,
			syntax: true,
			keepNames: true,
		},
	})
	if (!result.success) return false

	const sourceCode = await Bun.file(path).text()
	const description = sourceCode.match(/@file\s+(.+)/)?.[1]
	const widgetCode = getWidgetCode({
		name,
		description,
		srcPath: path,
		script: await Bun.file(`${outdir}/${fileName}`).text(),
	})
	await Bun.write(`out/pages/Widget#${name}.txt`, widgetCode)
	return true
}

await emptyDir('out')
const widgetEntries = await findEntities('src/widgets')
await Promise.all(widgetEntries.map((entity) => buildEntity({ type: 'widget', ...entity })))
