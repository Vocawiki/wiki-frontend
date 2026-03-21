export type BrowserTargetVersion = [number] | [number, number] | [number, number, number]

export type BrowserType = 'chrome' | 'edge' | 'safari' | 'firefox'

export type BrowserTargets = {
	[browser in BrowserType]?: BrowserTargetVersion
}

export const JS_BROWSER_TARGETS: BrowserTargets = {
	chrome: [109], // 最后一个支持Windows 7的Chrome版本
	edge: [79], // Edge迁移到Chromium后的第一个的版本，唉，还是对这些不更新浏览器的人太仁慈了。TODO: 时机成熟后移除
	safari: [16, 4],
	firefox: [115], // 最后一个支持Windows 7的Firefox版本
}

export const CSS_BROWSER_TARGETS: BrowserTargets = {
	chrome: [109],
	safari: [16, 3], // 虽然明面上是16.4，但是仁慈点。16.3与Chrome 109发布时间差不多
	firefox: [109], // 虽然明面上是115，但同上
}
