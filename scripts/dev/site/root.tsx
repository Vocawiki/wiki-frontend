/// <reference types="vite/client" />
import './.cache/software.css'
import './index.css'

import { ClientInitializer } from './app/client-initializer'
import { Preferences } from './app/preferences'
import { Router } from './app/router'

export function Root(props: { url: URL }) {
	return (
		<html
			suppressHydrationWarning
			className="client-js skin-theme-clientpref-day citizen-feature-autohide-navigation-clientpref-1 citizen-feature-image-dimming-clientpref-0 citizen-feature-pure-black-clientpref-0 citizen-feature-custom-font-size-clientpref-standard citizen-feature-custom-width-clientpref-standard citizen-feature-performance-mode-clientpref-0 citizen-header-position-left citizen-animations-ready"
			lang="zh-Hans-CN"
			dir="ltr"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
				<title>Vocawiki开发</title>
			</head>
			<body className="mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editable page-测试喵 rootpage-测试喵 skin-citizen action-view skin--responsive tab">
				<header className="mw-header citizen-header">
					<div className="citizen-header__logo">
						<a href="/" className="mw-logo citizen-header__button" title="访问首页">
							<img
								className="mw-logo-icon"
								src="Vocawiki_logo.svg"
								alt=""
								aria-hidden="true"
								height="32"
								width="32"
							/>
						</a>
					</div>

					<div className="citizen-header__inner">
						<div className="citizen-header__start"></div>
						<div className="citizen-header__end">
							<div className="citizen-preferences-dropdown citizen-header__item citizen-dropdown">
								<details id="citizen-preferences-details" className="citizen-dropdown-details">
									<summary
										className="citizen-dropdown-summary citizen-cdx-button--size-large cdx-button cdx-button--fake-button cdx-button--fake-button--enabled cdx-button--weight-quiet cdx-button--icon-only"
										title="打开/关闭外观设置菜单"
										aria-details="citizen-preferences-dropdown__card"
									>
										<span className="citizen-ui-icon mw-ui-icon-wikimedia-configure">
											<span style={{ position: 'absolute', inset: 0 }}>⚙️</span>
										</span>
										<span>打开/关闭外观设置菜单</span>
									</summary>
								</details>
								<div id="citizen-preferences-dropdown__card" className="citizen-menu__card">
									<div className="citizen-menu__card-content">
										<div id="citizen-preferences-content" className="citizen-preferences">
											<Preferences />
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</header>
				<div className="citizen-page-container">
					<div className="citizen-sitenotice-container">
						<div id="siteNotice">
							<div id="localNotice">
								<div className="sitenotice" lang="zh" dir="ltr">
									<p>这里是公告</p>
								</div>
							</div>
						</div>
					</div>
					<main className="mw-body ve-init-mw-desktopArticleTarget-targetContainer" id="content">
						<ClientInitializer />
						<Router {...props} />
					</main>

					<footer className="mw-footer citizen-footer" lang="zh-Hans-CN" dir="ltr"></footer>
				</div>
			</body>
		</html>
	)
}
