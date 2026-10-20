import { compileJS } from '@/scripts/build/compilers'
import type { InferGetStaticPropsType, GetStaticProps } from '@/tools/embeddable-html'

/**
 * 来源于已删除的{{假链|zhmoe:Widget:R-18|原始页面已删除}}，
 * 从[https://web.archive.org/web/20200811012316/https://zh.moegirl.org.cn/MARENOL 相关页面的Wayback Machine存档备份]中恢复，
 * 并针对新版MediaWiki加以修改。
 *
 * 进入代码仓库前的贡献者见 https://voca.wiki/Widget:R-18?action=history
 */
export default function R18({ script }: InferGetStaticPropsType<typeof getStaticProps>) {
	return (
		<>
			<style id="x18Style">{`
#mw-content-text {
  opacity: 0;
}

#x18 {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 999;
  opacity: 0;
}

#x18Context {
  position: relative;
  margin: 0 auto;
  margin-top: -40px;
  top: 50%;
  width: 240px;
  height: 80px;
  background: #444;
  color: white;
  border: solid 1px rgb(118, 195, 255);
  border-radius: 4px;
  box-shadow: 0 0 5px rgb(118, 195, 255);
  padding: 12px;
}

#x18Title {
  margin: 12px;
}

#x18Icon {
  position: relative;
  border: 8px solid transparent;
  border-left: 12px solid #fff;
  float: left;
  margin: 2px 0;
}

.x18Button {
  text-align: center;
}

.x18Button div {
  width: 72px;
  height: 20px;
  border-radius: 4px;
  padding: 4px;
  text-align: center;
  font-size: 11pt;
  display: inline-block;
  cursor: pointer;
  box-shadow: #777 0 0 22px inset;
}

.x18Button div:nth-child(2) {
  margin-left: 26px;
}

#x18Yes {
  background: rgb(57, 238, 0);
}

#x18No {
  background: rgb(238, 48, 0);
}
`}</style>
			<div id="x18" style={{ opacity: 0, transition: 'opacity 0.37s linear' }}>
				<div id="x18Context">
					<div id="x18Title">
						<div id="x18Icon" />
					</div>
					<div className="x18Button" />
				</div>
			</div>
			<div className="x18-page-warning" style={{ position: 'fixed', top: 0, left: 0, zIndex: 2 }}>
				<a href="/%E9%A6%96%E9%A1%B5">回到首页</a>
			</div>
			<script type="module">{script}</script>
		</>
	)
}

export const getStaticProps: GetStaticProps<{ script: string }> = async () => {
	const script = await compileJS(`${import.meta.dirname}/script.ts`)
	return { props: { script } }
}
