interface WidgetMetaBase {
	description?: string
}

export interface ScriptWidgetMeta_Module extends WidgetMetaBase {
	type: 'script'
	/** 输出`<script type="module" src="…"></script>` */
	scriptType: 'module'
}
export interface ScriptWidgetMeta_ModuleInline extends WidgetMetaBase {
	type: 'script'
	/** 输出`<script type="module">…</script>` */
	scriptType: 'module-inline'
}
export interface ScriptWidgetMeta_ClassicInlineNoChunk extends WidgetMetaBase {
	type: 'script'
	/** 输出`<script>…</script>` */
	scriptType: 'classic-inline-no-chunk'
}

export type ScriptWidgetMeta =
	| ScriptWidgetMeta_Module
	| ScriptWidgetMeta_ModuleInline
	| ScriptWidgetMeta_ClassicInlineNoChunk

export interface ComponentWidgetMeta extends WidgetMetaBase {
	type: 'component'
}

export type WidgetMeta = ScriptWidgetMeta | ComponentWidgetMeta
