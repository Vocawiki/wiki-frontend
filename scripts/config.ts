export const REPO_NAME = 'wiki-frontend'
export const REPO_URL = `https://github.com/Vocawiki/${REPO_NAME}`
export const BRANCH_NAME = 'main'
export const WIKI_API_URL = 'https://voca.wiki/api.php'

export const SOURCE_DIR = 'src'
export const SOURCE_DIR_EMBEDDABLE_HTML = `${SOURCE_DIR}/embeddable-html`
export const SOURCE_DIR_GADGETS = `${SOURCE_DIR}/gadgets`
export const SOURCE_DIR_TEMPLATES = `${SOURCE_DIR}/templates`

export const OUTPUT_DIR = 'out'

export const PAGES_DIR_IN_OUTPUT_DIR = 'pages'
export const PAGES_DIR = `${OUTPUT_DIR}/${PAGES_DIR_IN_OUTPUT_DIR}`

export const ASSETS_DIR_IN_OUTPUT_DIR = 'assets'
export const ASSETS_DIR = `${OUTPUT_DIR}/${ASSETS_DIR_IN_OUTPUT_DIR}`
export const ASSETS_BASE_URL_WITHOUT_ROUTE_PATH = `https://voca.wiki`
export const ASSETS_ROUT_PATH = `/${ASSETS_DIR_IN_OUTPUT_DIR}`
export const ASSETS_BASE_URL = `${ASSETS_BASE_URL_WITHOUT_ROUTE_PATH}${ASSETS_ROUT_PATH}`

export const REFERENCED_FILES_PATH = `${OUTPUT_DIR}/referenced-files.txt`
export const NONDEFAULT_CONTENT_MODELS_PATH = `${OUTPUT_DIR}/nondefault-content-models.json`
