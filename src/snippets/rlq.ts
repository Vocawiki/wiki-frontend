declare global {
	interface Window {
		RLQ?: [string | string[], () => unknown][]
	}
}

// 使用`||`而非`??`以提升兼容性，我知道打包器也会转换`??`语法，但那样会增大体积
// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
const rlq = window.RLQ || (window.RLQ = [])

export const depend = (dependency: string | string[], func: () => unknown) => {
	rlq.push([dependency, func])
}
