import '@/lib/server-only'

import { compileJS } from '@/scripts/build/compilers'

const scriptContent = await compileJS(
	{
		input: `${import.meta.dirname}/inline-script.ts`,
		transform: { target: 'es2015' },
	},
	{ format: 'iife', strict: true, generatedCode: { preset: 'es2015' } },
)

export default function GlobalBodyBottom() {
	return (
		<>
			<div
				hidden
				id="low-ua-version-alert"
				className="preflight"
				role="alertdialog"
				aria-labelledby="low-ua-version-alert-label"
				aria-describedby="low-ua-version-alert-desc"
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					fontSize: '1rem',
					lineHeight: 1.25,
					position: 'fixed',
					'--构建时去掉这个属性名和后面的冒号只保留值-1': 'bottom:0',
					bottom: 'env(safe-area-inset-bottom)',
					'--构建时去掉这个属性名和后面的冒号只保留值-2': 'left:0',
					left: 'env(safe-area-inset-left)',
					'--构建时去掉这个属性名和后面的冒号只保留值-3': 'right:0',
					right: 'env(safe-area-inset-right)',
					zIndex: 200,
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						padding: '1rem 0.875rem 1rem 1rem',
						color: '#ffffff',
						backgroundColor: '#df185f',
						pointerEvents: 'auto',
						borderRadius: '0.5rem',
						margin: '1rem 1rem 2rem',
						boxShadow: '0 0.25rem 1rem rgba(223, 24, 95, 0.5)',
					}}
				>
					<div>
						<span id="low-ua-version-alert-label">
							你的浏览器内核版本过低，网站内容与功能可能无法按预期呈现与生效，建议升级/更换浏览器。
						</span>
						<span id="low-ua-version-alert-desc">
							请查阅
							<a
								href="/Help:%E6%B5%8F%E8%A7%88%E5%99%A8%E5%85%BC%E5%AE%B9%E6%80%A7"
								title="Help:浏览器兼容性"
								style={{
									color: '#fff1b7',
									textDecoration: 'underline',
									textUnderlineOffset: '0.25em',
									textDecorationThickness: 'from-font',
								}}
							>
								帮助:浏览器兼容性
							</a>
							。
						</span>
					</div>
					<button
						type="button"
						className="select-none"
						aria-label="关闭提示"
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							flexShrink: 0,
							marginLeft: '1rem',
							backgroundColor: '#fff',
							width: '1.25em',
							height: '1.25em',
							borderRadius: '1em',
							cursor: 'pointer',
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 24 24"
							stroke="#df185f"
							strokeWidth="2.5"
							strokeLinecap="round"
							style={{ width: '1em', height: '1em' }}
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				</div>
			</div>
			{/* 为了兼容性，此处不使用type="module" */}
			<script>{scriptContent}</script>
		</>
	)
}
