/// <reference types="vite/client" />
import './.cache/software.css'
import './index.css'

import { Router } from './app/router'

export function Root(props: { url: URL }) {
	return (
		<html
			className="client-js skin-theme-clientpref-day citizen-feature-autohide-navigation-clientpref-1 citizen-feature-pure-black-clientpref-0 citizen-feature-custom-font-size-clientpref-standard citizen-feature-custom-width-clientpref-standard citizen-feature-performance-mode-clientpref-0 citizen-header-position-left citizen-animations-ready"
			lang="zh-Hans-CN"
			dir="ltr"
		>
			<head>
				<meta charSet="UTF-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
				<title>Vocawiki开发</title>
				<style>
					{`
#citizen-preferences__card form {
	display: grid;
	grid-template-columns: repeat(var(--pref-columns, 2), 1fr);
	gap: var(--space-xxs);
	padding-inline: var(--space-md);
}
.citizen-preferences-content {
	display: flex;
	flex-direction: column;
	gap: var(--space-xs);
	padding-block: var(--space-xs);
}
.citizen-client-prefs-radio__input {
	display: none;
}
.citizen-client-prefs-radio__input:checked ~ .citizen-client-prefs-radio__label {
	border-color: var(--color-progressive);
}
.citizen-client-prefs-radio__label {
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	padding: var(--space-xs) var(--space-md);
	font-weight: var(--font-weight-medium);
	cursor: pointer;
	border: var(--border-width-thick) solid var(--border-color-base);
	border-radius: var(--border-radius-medium);
}
.citizen-client-prefs-radio__label:hover {
	border-color: var(--color-progressive--hover);
}
.citizen-client-prefs-radio__label:active {
	border-color: var(--color-progressive--active);
}
#citizen-client-prefs .citizen-menu__content {
	padding: 0 var(--space-md);
}
#skin-client-prefs-skin-theme {
	--pref-columns: 3;
}
#skin-client-prefs-skin-theme .citizen-client-prefs-radio__label {
	background: var(--color-surface-0);
}
#skin-client-prefs-skin-theme
	.citizen-client-prefs-radio__label[htmlFor='skin-client-pref-skin-theme-value-day'] {
	color: hsl(var(--color-progressive-hsl__h), 30%, 20%);
	background: hsl(var(--color-progressive-hsl__h), 30%, 96%);
}
#skin-client-prefs-skin-theme
	.citizen-client-prefs-radio__label[htmlFor='skin-client-pref-skin-theme-value-night'] {
	color: hsl(var(--color-progressive-hsl__h), 25%, 80%);
	background: hsl(var(--color-progressive-hsl__h), 20%, 10%);
}
#skin-client-prefs-citizen-feature-custom-font-size {
	--pref-columns: 2;
}
#skin-client-prefs-citizen-feature-custom-width {
	--pref-columns: 3;
}
#skin-client-prefs-citizen-feature-pure-black {
	display: none;
}
.skin-theme-clientpref-night #skin-client-prefs-citizen-feature-pure-black {
	display: block;
}
@media (prefers-color-scheme: dark) {
	.skin-theme-clientpref-os #skin-client-prefs-citizen-feature-pure-black {
		display: block;
	}
}
#skin-client-prefs-citizen-feature-pure-black
	.citizen-client-prefs-radio__label[htmlFor='skin-client-pref-citizen-feature-pure-black-value-1'] {
	background-color: #000;
}
#skin-client-prefs-citizen-feature-autohide-navigation {
	display: none;
}
@media (max-width: 1119.98px) {
	#skin-client-prefs-citizen-feature-autohide-navigation {
		display: block;
	}
}
#skin-client-prefs-citizen-feature-autohide-navigation form {
	grid-template-columns: repeat(2, 1fr);
}`}
				</style>
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
							<div className="citizen-preferences citizen-header__item citizen-dropdown">
								<details id="citizen-preferences-details" className="citizen-dropdown-details">
									<summary
										className="citizen-dropdown-summary"
										title="打开/关闭外观设置菜单"
										aria-details="citizen-preferences__card"
									>
										<span className="citizen-ui-icon"></span>
										<span>打开/关闭外观设置菜单</span>
									</summary>
								</details>
								<div id="citizen-preferences__card" className="citizen-menu__card">
									<div className="citizen-menu__card-content">
										<div id="citizen-preferences-content" className="citizen-preferences-content">
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-citizen-feature-custom-font-size mw-portlet-js citizen-menu"
												id="skin-client-prefs-citizen-feature-custom-font-size"
											>
												<div className="citizen-menu__heading">文字</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-font-size-group"
																			id="skin-client-pref-citizen-feature-custom-font-size-value-small"
																			type="radio"
																			value="small"
																			data-event-name="skin-client-pref-citizen-feature-custom-font-size-value-small"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-font-size-value-small"
																			className="citizen-client-prefs-radio__label"
																		>
																			小
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-font-size-group"
																			id="skin-client-pref-citizen-feature-custom-font-size-value-standard"
																			type="radio"
																			value="standard"
																			data-event-name="skin-client-pref-citizen-feature-custom-font-size-value-standard"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-font-size-value-standard"
																			className="citizen-client-prefs-radio__label"
																		>
																			标准
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-font-size-group"
																			id="skin-client-pref-citizen-feature-custom-font-size-value-large"
																			type="radio"
																			value="large"
																			data-event-name="skin-client-pref-citizen-feature-custom-font-size-value-large"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-font-size-value-large"
																			className="citizen-client-prefs-radio__label"
																		>
																			大
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-font-size-group"
																			id="skin-client-pref-citizen-feature-custom-font-size-value-xlarge"
																			type="radio"
																			value="xlarge"
																			data-event-name="skin-client-pref-citizen-feature-custom-font-size-value-xlarge"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-font-size-value-xlarge"
																			className="citizen-client-prefs-radio__label"
																		>
																			特大
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-skin-theme mw-portlet-js citizen-menu"
												id="skin-client-prefs-skin-theme"
											>
												<div className="citizen-menu__heading">颜色</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-skin-theme-group"
																			id="skin-client-pref-skin-theme-value-os"
																			type="radio"
																			value="os"
																			data-event-name="skin-client-pref-skin-theme-value-os"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-skin-theme-value-os"
																			className="citizen-client-prefs-radio__label"
																		>
																			自动
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-skin-theme-group"
																			id="skin-client-pref-skin-theme-value-day"
																			type="radio"
																			value="day"
																			data-event-name="skin-client-pref-skin-theme-value-day"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-skin-theme-value-day"
																			className="citizen-client-prefs-radio__label"
																		>
																			浅色
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-skin-theme-group"
																			id="skin-client-pref-skin-theme-value-night"
																			type="radio"
																			value="night"
																			data-event-name="skin-client-pref-skin-theme-value-night"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-skin-theme-value-night"
																			className="citizen-client-prefs-radio__label"
																		>
																			深色
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-citizen-feature-custom-width mw-portlet-js citizen-menu"
												id="skin-client-prefs-citizen-feature-custom-width"
											>
												<div className="citizen-menu__heading">宽度</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-width-group"
																			id="skin-client-pref-citizen-feature-custom-width-value-standard"
																			type="radio"
																			value="standard"
																			data-event-name="skin-client-pref-citizen-feature-custom-width-value-standard"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-width-value-standard"
																			className="citizen-client-prefs-radio__label"
																		>
																			标准
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-width-group"
																			id="skin-client-pref-citizen-feature-custom-width-value-wide"
																			type="radio"
																			value="wide"
																			data-event-name="skin-client-pref-citizen-feature-custom-width-value-wide"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-width-value-wide"
																			className="citizen-client-prefs-radio__label"
																		>
																			宽
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-custom-width-group"
																			id="skin-client-pref-citizen-feature-custom-width-value-full"
																			type="radio"
																			value="full"
																			data-event-name="skin-client-pref-citizen-feature-custom-width-value-full"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-custom-width-value-full"
																			className="citizen-client-prefs-radio__label"
																		>
																			全宽
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-citizen-feature-pure-black mw-portlet-js citizen-menu"
												id="skin-client-prefs-citizen-feature-pure-black"
											>
												<div className="citizen-menu__heading">纯黑模式</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-pure-black-group"
																			id="skin-client-pref-citizen-feature-pure-black-value-0"
																			type="radio"
																			value="0"
																			data-event-name="skin-client-pref-citizen-feature-pure-black-value-0"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-pure-black-value-0"
																			className="citizen-client-prefs-radio__label"
																		>
																			关闭
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-pure-black-group"
																			id="skin-client-pref-citizen-feature-pure-black-value-1"
																			type="radio"
																			value="1"
																			data-event-name="skin-client-pref-citizen-feature-pure-black-value-1"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-pure-black-value-1"
																			className="citizen-client-prefs-radio__label"
																		>
																			开启
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-citizen-feature-autohide-navigation mw-portlet-js citizen-menu"
												id="skin-client-prefs-citizen-feature-autohide-navigation"
											>
												<div className="citizen-menu__heading">自动隐藏导航</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-autohide-navigation-group"
																			id="skin-client-pref-citizen-feature-autohide-navigation-value-0"
																			type="radio"
																			value="0"
																			data-event-name="skin-client-pref-citizen-feature-autohide-navigation-value-0"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-autohide-navigation-value-0"
																			className="citizen-client-prefs-radio__label"
																		>
																			关闭
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-autohide-navigation-group"
																			id="skin-client-pref-citizen-feature-autohide-navigation-value-1"
																			type="radio"
																			value="1"
																			data-event-name="skin-client-pref-citizen-feature-autohide-navigation-value-1"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-autohide-navigation-value-1"
																			className="citizen-client-prefs-radio__label"
																		>
																			开启
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
											<div
												className="mw-portlet mw-portlet-skin-client-prefs-citizen-feature-performance-mode mw-portlet-js citizen-menu"
												id="skin-client-prefs-citizen-feature-performance-mode"
											>
												<div className="citizen-menu__heading">效能模式</div>
												<div className="citizen-menu__content">
													<ul className="citizen-menu__content-list">
														<li className="mw-list-item mw-list-item-js">
															<div className="">
																<form>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-performance-mode-group"
																			id="skin-client-pref-citizen-feature-performance-mode-value-0"
																			type="radio"
																			value="0"
																			data-event-name="skin-client-pref-citizen-feature-performance-mode-value-0"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-performance-mode-value-0"
																			className="citizen-client-prefs-radio__label"
																		>
																			关
																		</label>
																	</div>
																	<div className="citizen-client-prefs-radio">
																		<input
																			name="skin-client-pref-citizen-feature-performance-mode-group"
																			id="skin-client-pref-citizen-feature-performance-mode-value-1"
																			type="radio"
																			value="1"
																			data-event-name="skin-client-pref-citizen-feature-performance-mode-value-1"
																			className="citizen-client-prefs-radio__input"
																		/>
																		<span className="citizen-client-prefs-radio__icon"></span>
																		<label
																			htmlFor="skin-client-pref-citizen-feature-performance-mode-value-1"
																			className="citizen-client-prefs-radio__label"
																		>
																			开
																		</label>
																	</div>
																</form>
															</div>
														</li>
													</ul>
												</div>
											</div>
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
				<script type="module" src="app/entry-client.tsx"></script>
			</body>
		</html>
	)
}
