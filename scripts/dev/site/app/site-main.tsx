import type { ReactNode } from 'react'

export function SiteMain({ title, children }: { title: ReactNode; children?: ReactNode }) {
	return (
		<>
			<header className="mw-body-header citizen-page-header" id="citizen-page-header">
				<div className="citizen-page-header-inner">
					<div className="citizen-page-heading">
						<div className="firstHeading-container">
							<h1
								id="firstHeading"
								className="firstHeading mw-first-heading"
								lang="zh-Hans-CN"
								dir="ltr"
							>
								<span className="mw-page-title-main">{title}</span>
							</h1>

							<div className="mw-indicators"></div>
						</div>
						<div id="siteSub">来自Vocawiki</div>
					</div>
				</div>
			</header>
			<div id="citizen-page-header-sticky-sentinel"></div>
			<div className="citizen-body-container">
				<div id="bodyContent" className="citizen-body" aria-labelledby="firstHeading">
					<div id="contentSub" lang="zh-Hans-CN" dir="ltr">
						<div id="mw-content-subtitle" lang="zh-Hans-CN" dir="ltr"></div>
					</div>

					<div id="mw-content-text" className="mw-body-content">
						<div className="mw-content-ltr mw-parser-output" lang="zh-Hans-CN" dir="ltr">
							{children}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
