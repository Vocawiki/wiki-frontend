import * as Wiki from '~/components/wikitext'

export function Tools() {
	return (
		<div className="flex flex-col gap-2">
			<div>
				<DraftBox />
			</div>
		</div>
	)
}

function DraftBox() {
	return (
		<Wiki.Link page="Special:EditRecovery">
			草稿箱<div>未保存的编辑</div>
		</Wiki.Link>
	)
}
