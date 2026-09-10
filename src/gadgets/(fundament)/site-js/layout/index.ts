import { clarifyOldRevisionLicense } from './legacy-license'
import { applyListMargin } from './list-margin'
import { tabs } from './tabs'
import { 使挂删模板位于文件页顶部 } from './使挂删模板位于文件页顶部'

export function modifyLayout(): void {
	tabs()
	applyListMargin()
	clarifyOldRevisionLicense()
	使挂删模板位于文件页顶部()
}
