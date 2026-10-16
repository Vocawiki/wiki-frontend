export type EmbeddableHtmlPlace = 'in-place' | 'head' | 'body'
export type EmbeddableHtmlScriptType = 'module' | 'module-inline' | 'classic-inline-no-import'

interface EmbeddableHtmlMetaBase {
	position: EmbeddableHtmlPlace
}

export interface EmbeddableHtmlMeta_StaticMarkup extends EmbeddableHtmlMetaBase {
	type: 'static-markup'
}

export interface EmbeddableHtmlMeta_Script extends EmbeddableHtmlMetaBase {
	type: 'script'
	scriptType: EmbeddableHtmlScriptType
}

export type EmbeddableHtmlMeta = EmbeddableHtmlMeta_StaticMarkup | EmbeddableHtmlMeta_Script
