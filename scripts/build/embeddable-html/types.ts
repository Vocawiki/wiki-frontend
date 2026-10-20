import type { EmptyObject, UnknownRecord } from 'type-fest'

import type { GetStaticProps } from '@/tools/embeddable-html'

export type StaticMarkupEmbeddableHtmlIndexModule<Props extends UnknownRecord = UnknownRecord> =
	| {
			default: (props?: EmptyObject) => React.ReactNode
	  }
	| {
			default: (props: Props) => React.ReactNode
			getStaticProps: GetStaticProps<Props>
	  }
