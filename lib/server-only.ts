if (typeof window !== 'undefined') {
	throw new Error('禁止在浏览器导入此模块')
}

import 'react'

declare module 'react' {
	interface CSSProperties {
		/**
		 * 设置这个属性是为了能够在一个行内样式中多次定义重复属性，以实现fallback的效果。
		 *
		 * 例如：
		 * ```tsx
		 * <div
		 *   style={{
		 * 	   '--构建时去掉这个属性名和后面的冒号只保留值-1': 'bottom:0',
		 *     'bottom': 'env(safe-area-inset-bottom)',
		 *   }}
		 * />
		 * ```
		 *
		 * 编译后会变成：
		 * ```html
		 * <div style="bottom:0;bottom:env(safe-area-inset-bottom);"></div>
		 * ```
		 *
		 * 这样就可以在不支持env()的浏览器中使用fallback值。
		 *
		 * 注意：这个属性名是为了编译时去掉的，运行时不会生效。
		 *
		 * 另见component-compiler.ts
		 */
		[key: `--构建时去掉这个属性名和后面的冒号只保留值-${number}`]: string
	}
}
