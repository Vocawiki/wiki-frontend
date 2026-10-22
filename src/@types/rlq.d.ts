// 参考：
// https://doc.wikimedia.org/mediawiki-core/1.45.6/js/mediawiki.base_mediawiki.base.js.html

import type { IsNever, Tagged } from 'type-fest'

type DependenciesReadyHandler = Parameters<typeof mw.loader.using>[1]

type TypeErrorMessage<T> = Tagged<T, 'TypeErrorMessage'>

// https://www.mediawiki.org/wiki/ResourceLoader/Core_modules 说：
// jquery 和 mediawiki.base 模块共同构成基础环境（“启动环境”），并且始终存在。它们不能被声明为依赖项。
type IsResourceLoaderDependency<T extends string> = T extends 'jquery' | 'mediawiki.base'
	? false
	: string extends T
		? false
		: true
type IsResourceLoaderDependencies<T extends string | string[]> = T extends string
	? IsResourceLoaderDependency<T>
	: { [Index in keyof T]: IsResourceLoaderDependency<T[Index]> }[number] extends true
		? true
		: false

export interface ResourceLoaderQueue {
	/** MediaWiki的RLQ也支持push一个函数，但这与直接执行没有区别，为防止误用，此处没有声明该重载 */
	push: <const Dependencies extends string | string[]>(
		entry: [
			IsResourceLoaderDependencies<Dependencies> extends true
				? Dependencies
				: TypeErrorMessage<"依赖不能包含'jquery'、'mediawiki.base'，也不能是宽泛的string类型">,
			DependenciesReadyHandler,
		],
	) => void
}

declare global {
	interface Window {
		RLQ?: ResourceLoaderQueue
	}
}
