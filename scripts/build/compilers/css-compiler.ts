import * as sass from 'sass-embedded'

export async function compileSCSS(path: string): Promise<string> {
	const result = await sass.compileAsync(path, { charset: false })
	return result.css
}
