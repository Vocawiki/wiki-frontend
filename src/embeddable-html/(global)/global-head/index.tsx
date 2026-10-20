import '@/lib/server-only'

import { compileJS } from '@/scripts/build/compilers'

const scriptContent = await compileJS(`${import.meta.dirname}/observe-content-width.ts`)

export default function GlobalHead() {
	// 为了阻塞渲染，此处不使用type="module"
	return <script>{scriptContent}</script>
}
