import { parseArgs } from 'node:util'

const { values: args } = parseArgs({
	args: Bun.argv,
	options: {
		summary: {
			type: 'string',
			short: 's',
		},
		help: {
			type: 'boolean',
			short: 'h',
		},
	},
	strict: true,
	allowPositionals: true,
})

console.log(args)
function f(arg = 'test') {
	console.log(arg)
}
f(args.summary)
