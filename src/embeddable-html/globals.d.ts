/**
 * 本目录下的脚本以“片段（fragment）”形式嵌入 MediaWiki 页面，运行时依赖由
 * ResourceLoader（`window.RLQ`）或站内小工具提供的全局变量。
 * 这些库不会被打包进产物，因此此处只补充类型声明，不产生任何运行时代码。
 */

// #region moment（ResourceLoader 模块 `moment`）
declare function moment(
	input?: string | number | Date | moment.Moment | null,
	format?: string,
): moment.Moment

declare namespace moment {
	interface Moment {
		isBefore: (other: Moment | string) => boolean
		isAfter: (other: Moment | string) => boolean
		isSame: (other: Moment | string) => boolean
		isValid: () => boolean
		year: () => number
		month: () => number
		date: () => number
		day: () => number
		hour: () => number
		minute: () => number
		second: () => number
		format: (format?: string) => string
		toDate: () => Date
		valueOf: () => number
	}
	interface Duration {
		humanize: (withSuffix?: boolean) => string
		asSeconds: () => number
		asMilliseconds: () => number
	}
	function duration(input?: number | string, unit?: string): Duration
}
// #endregion

// #region echarts（由脚本动态插入 <script> 加载）
interface EchartsInstance {
	setOption: (option: Record<string, unknown>, ...args: unknown[]) => void
	resize: (opts?: Record<string, unknown>) => void
	on: (event: string, handler: (...args: unknown[]) => void) => void
	group: string
	oldGroup?: string
}

declare const echarts: {
	init: (
		dom: HTMLElement | null,
		theme?: string | Record<string, unknown>,
		opts?: Record<string, unknown>,
	) => EchartsInstance
	connect: (instances: unknown[]) => void
}
// #endregion

// #region MathJax（由脚本动态插入 <script> 加载）
interface MathJaxConfig {
	tex?: Record<string, unknown>
	options?: Record<string, unknown>
	startup?: {
		ready?: () => void
		pageReady?: () => Promise<void>
		[key: string]: unknown
	}
	typeset?: (elements?: Element[]) => void
	typesetPromise?: (elements?: Element[]) => Promise<void>
	[key: string]: unknown
}

declare const MathJax: MathJaxConfig

interface Window {
	MathJax?: MathJaxConfig
}
// #endregion

// #region 站内小工具提供的全局函数
// 返回 jQuery 对象，但这里刻意声明为 any：该函数由 libBottomRightCorner 注入，
// 若在此给出精确类型，会让该小工具自身的 oxlint 抑制失去作用（改动范围仅限本目录，不便连带修改）。
declare function insertToBottomRightCorner(text: unknown): any
// #endregion
