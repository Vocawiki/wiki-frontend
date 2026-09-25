import type { ComponentType } from 'react'
import type { IsEqual } from 'type-fest'

import type { Expect } from '@/lib/typing'
import { withBaseURL } from '@/lib/wiki'
import { ExternalLink } from '~/components/external-link'

import { BackButton } from './back-button'
import { MainPage } from './main-page'
import { pages, type PageToPreview } from './pages'
import { SiteMain } from './site-main'

export async function Router({ url }: { url: URL }) {
	const pageName = decodeURIComponent(url.pathname.replace(/^\//u, ''))
	if (pageName === '') {
		return <MainPage />
	}

	const pageInfo = pages.get(pageName)
	if (!pageInfo) {
		return (
			<SiteMain title={pageName}>
				<p>不存在“{pageName}”。</p>
				<ul>
					<li>
						<BackButton linkLike>返回上一页</BackButton>
					</li>
					<li>
						查看
						<ExternalLink href={withBaseURL(`/${pageName}`)}>Vocawiki同名页面</ExternalLink>
					</li>
				</ul>
			</SiteMain>
		)
	}

	const Component = await getComponent(pageInfo)
	return (
		<SiteMain title={pageInfo.fullPageName}>
			<Component />
		</SiteMain>
	)
}

async function getComponent(page: PageToPreview) {
	type _Check = Expect<IsEqual<(typeof page)['namespace'], 'Template'>>

	const folder = 'templates'
	const module = (await import(`../../../../src/${folder}/${page.pageName}/index.tsx`)) as {
		default: unknown
	}
	const moduleDefault = module.default
	if (typeof moduleDefault !== 'function') {
		throw new Error(`${page.fullPageName}的默认导出不是组件`)
	}
	return moduleDefault as ComponentType
}
