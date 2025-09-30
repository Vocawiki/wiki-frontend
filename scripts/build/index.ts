import { emptyDir } from 'fs-extra/esm'

import { buildGadgets } from './gadget'
import { buildWidgets } from './widget'

await emptyDir('out')
const tasks = [buildGadgets(), buildWidgets()]
await Promise.all(tasks)
