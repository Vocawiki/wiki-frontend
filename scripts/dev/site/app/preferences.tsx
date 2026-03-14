'use client'

const fontSizeOptions = ['small', 'standard', 'large', 'xlarge'] as const
const themeOptions = ['os', 'day', 'night'] as const
const widthOptions = ['standard', 'wide', 'full'] as const
const pureBlackOptions = ['0', '1'] as const
const performanceModeOptions = ['0', '1'] as const

function makeSetter<T extends readonly string[]>(options: T, base: string) {
	return (newOption: T[number]) => {
		const classList = document.documentElement.classList
		for (const option of options) {
			classList.remove(base + option)
		}
		classList.add(base + newOption)
	}
}

export function Preferences() {
	const setFontSize = makeSetter(fontSizeOptions, 'citizen-feature-custom-font-size-clientpref-')
	const setTheme = makeSetter(themeOptions, 'skin-theme-clientpref-')
	const setWidth = makeSetter(widthOptions, 'citizen-feature-custom-width-clientpref-')
	const setPureBlack = makeSetter(pureBlackOptions, 'citizen-feature-pure-black-clientpref-')
	const setPerformanceMode = makeSetter(
		performanceModeOptions,
		'citizen-feature-performance-mode-clientpref-',
	)

	return (
		<>
			<style>{styles}</style>
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
											<div>
												<form
													onChange={(e) => {
														const target = e.target as unknown as HTMLInputElement
														// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
														setFontSize(target.value as any)
													}}
												>
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
											<div>
												<form
													onChange={(e) => {
														const target = e.target as unknown as HTMLInputElement
														// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
														setTheme(target.value as any)
													}}
												>
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
											<div>
												<form
													onChange={(e) => {
														const target = e.target as unknown as HTMLInputElement
														// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
														setWidth(target.value as any)
													}}
												>
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
											<div>
												<form
													onChange={(e) => {
														const target = e.target as unknown as HTMLInputElement
														// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
														setPureBlack(target.value as any)
													}}
												>
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
											<div>
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
											<div>
												<form
													onChange={(e) => {
														const target = e.target as unknown as HTMLInputElement
														// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
														setPerformanceMode(target.value as any)
													}}
												>
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
		</>
	)
}

const styles = `
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
}`
