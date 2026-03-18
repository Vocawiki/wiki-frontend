import type { ComponentType } from 'react'

import { withBaseURL } from '@/lib/wiki'

import { BackButton } from './back-button'
import { MainPage } from './main-page'
import { pages, type PageToPreview } from './pages'
import { SiteMain } from './site-main'

export async function Router({ url }: { url: URL }) {
	const pageName = decodeURIComponent(url.pathname.replace(/^\//, ''))
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
						<a href={withBaseURL(`/${pageName}`)} target="_blank">
							Vocawiki同名页面
						</a>
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
	if (page.namespace !== 'Template') {
		throw new Error('未实现')
	}
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
