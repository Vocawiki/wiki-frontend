import { emptyDir } from 'fs-extra/esm'

import { saveReferencedFiles } from '@/tools/file-usage'

import { buildGadgets } from './gadget'
import { buildWidgets } from './widget'
import { buildWikitextPages } from './wikitext'

await emptyDir('out/pages')
const tasks = [buildGadgets(), buildWidgets(), buildWikitextPages()]
await Promise.all(tasks)
await saveReferencedFiles()
