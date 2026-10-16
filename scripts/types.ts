import * as z from 'zod'

export const contentModelSchema = z
	.enum([
		// Built-in
		'GadgetDefinition',
		'JsonSchema',
		'MassMessageListContent',
		'NewsletterContent',
		'Scribunto',
		'SecurePoll',
		'css',
		'javascript',
		'json',
		'sanitized-css',
		'text',
		'translate-messagebundle',
		'vue',
		'wikitext',
		'worklist',
		// Vocawiki only
		'html',
		'headhtml',
		'bodyhtml',
	])
	.meta({ title: '内容模型' })
export type ContentModel = z.infer<typeof contentModelSchema>
