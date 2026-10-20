import type { Promisable, UnknownRecord } from 'type-fest'

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

export type CreateAssetUrl = (filePath: string) => Promise<string>
export interface GetStaticPropsContext {
	createAssetUrl: CreateAssetUrl
}
export type GetStaticProps<Props extends UnknownRecord> = (
	ctx: GetStaticPropsContext,
) => Promisable<{ props: Props }>
export type InferGetStaticPropsType<Getter extends GetStaticProps<UnknownRecord>> =
	Getter extends GetStaticProps<infer Props> ? Props : never
