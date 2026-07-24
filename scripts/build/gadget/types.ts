import type { SetRequired } from 'type-fest'

import type { GadgetMeta } from '@/tools/gadget'

/** 解析后的gadget元数据，将留空的pages转换为具体页面 */
export type ParsedGadgetMeta = SetRequired<GadgetMeta, 'pages'> & { name: string }
