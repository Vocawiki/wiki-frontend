import { scheduleBuildTasksForEmbeddableHtml } from './embeddable-html'
import { scheduleBuildTasksForGadgets } from './gadget'
import { buildStages as stages, buildContext as context } from './stages-and-context'
import { scheduleBuildTasksForWikitextPages } from './wikitext'

export async function build() {
	scheduleBuildTasksForGadgets(context)
	scheduleBuildTasksForEmbeddableHtml(context)
	scheduleBuildTasksForWikitextPages(context)

	await stages.start.run()
	await Promise.all([
		stages.buildScriptEntries.run(context),
		stages.saveNondefaultContentModels.run(context),
		stages.saveReferencedFiles.run(),
	])
	await stages.end.run()
}
