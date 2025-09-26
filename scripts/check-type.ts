import { $ } from 'bun'

const packageDirs = ['.', './src']
for (const dir of packageDirs) {
	console.log(`Checking '${dir}'...`)
	await checkType(dir)
}
console.log('Done.')

async function checkType(dir: string) {
	await $`bun run tsc -p ${`${dir}/tsconfig.json`} --noEmit`
}
