export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
export const IS_DEVELOPMENT = !IS_PRODUCTION
/** 本选项供React组件使用，是否把wikitext渲染为HTML */
export const SHOULD_CONVERT_WIKITEXT_TO_HTML = Boolean(process.env.SHOULD_CONVERT_WIKITEXT_TO_HTML)

export const BASE_URL = IS_DEVELOPMENT ? 'https://voca.wiki' : ''

/** 开发预览时，站点样式的缓存时长 */
export const WIKI_STYLES_CACHE_TTL = Temporal.Duration.from({ hours: 12 })
