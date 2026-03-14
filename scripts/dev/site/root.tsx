/// <reference types="vite/client" />
import './.cache/software.css'
import './index.css'

import { Preferences } from './app/preferences'
import { Router } from './app/router'

export function Root(props: { url: URL }) {
	return (
		<html
			suppressHydrationWarning
			className="client-js skin-theme-clientpref-day citizen-feature-autohide-navigation-clientpref-1 citizen-feature-pure-black-clientpref-0 citizen-feature-custom-font-size-clientpref-standard citizen-feature-custom-width-clientpref-standard citizen-feature-performance-mode-clientpref-0 citizen-header-position-left citizen-animations-ready"
			lang="zh-Hans-CN"
			dir="ltr"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
				<title>Vocawiki开发</title>
			</head>
			<body className="citizen-sections-enabled mediawiki ltr sitedir-ltr mw-hide-empty-elt ns-0 ns-subject mw-editable page-测试喵 rootpage-测试喵 skin-citizen action-view skin--responsive tab main-md main-sm main-lg">
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

					<div className="citizen-search citizen-header__item citizen-dropdown">
						<div id="citizen-search-details" className="citizen-dropdown-details">
							<div
								id="citizen-search-summary"
								className="citizen-dropdown-summary"
								title="打开/关闭搜索 [/]"
							>
								<span className="citizen-ui-icon">
									<span></span>
									<span></span>
									<span></span>
								</span>
								<span>打开/关闭搜索</span>
							</div>
						</div>
					</div>

					<div className="citizen-drawer citizen-header__item citizen-dropdown">
						<div className="citizen-dropdown-details">
							<div
								className="citizen-dropdown-summary"
								title="打开/关闭菜单"
								aria-details="citizen-drawer__card"
							>
								<span className="citizen-ui-icon">
									<span></span>
									<span></span>
									<span></span>
								</span>
								<span>打开/关闭菜单</span>
							</div>
						</div>
					</div>
					<div className="citizen-header__inner">
						<div className="citizen-header__start"></div>
						<div className="citizen-header__end">
							<Preferences />
						</div>
					</div>
				</header>
				<div className="citizen-page-container">
					<div className="citizen-sitenotice-container">
						<div id="siteNotice">
							<div id="localNotice" data-nosnippet="">
								<div className="sitenotice" lang="zh" dir="ltr">
									<ul className="scrollDiv scrolling" style={{ height: '20.8px' }}>
										<li style={{ top: '0' }}>这里是公告</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
					<main className="mw-body ve-init-mw-desktopArticleTarget-targetContainer" id="content">
						<Router {...props} />
					</main>

					<footer className="mw-footer citizen-footer" lang="zh-Hans-CN" dir="ltr">
						<div className="citizen-footer__container">
							<section className="citizen-footer__content">喵喵喵喵喵</section>
							<section className="citizen-footer__bottom">
								喵喵喵喵喵
								<br />
								<br />
							</section>
						</div>
					</footer>
				</div>
			</body>
		</html>
	)
}
