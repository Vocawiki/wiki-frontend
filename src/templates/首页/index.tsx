import { BilibiliVideos } from './bilibili-videos'
import { ExternalSites } from './external-sites'
import { Topics } from './topics'

export default function MainPage() {
	return (
		<div className="space-y-12">
			<div className="preflight">
				<Topics />
			</div>
			{'{{{1|}}}'}
			<div className="preflight plainlinks mb-14 space-y-12 leading-none">
				<BilibiliVideos />
				<ExternalSites />
			</div>
			<style>
				{`
  .grid-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr); /* 4等分列 */
    gap: 10px;
  }

  .box {
    background-color: #4CAF50;
    color: white;
    padding: 20px;
    text-align: center;
  }

  .fill-remaining {
    grid-column: auto / -1; 
    background-color: #f44336; /* 标红以示区别 */
  }`}
			</style>

			<div className="grid-container">
				<div className="box">正常元素 1 (占1列)</div>
				<div className="box fill-remaining">占满剩余列的元素</div>

				<div className="box">正常元素 3</div>
				<div className="box">正常元素 4</div>
				<div className="box fill-remaining">占满剩余列的元素</div>
			</div>
		</div>
	)
}
