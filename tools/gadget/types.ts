import type { NonEmptyTuple } from 'type-fest'

/**
 * 用户权限
 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:User_rights#List_of_permissions 用户权限列表}
 */
export type UserRight =
	| 'read'
	| 'applychangetags'
	| 'autocreateaccount'
	| 'createaccount'
	| 'createpage'
	| 'createtalk'
	| 'delete-redirect'
	| 'edit'
	| 'editsemiprotected'
	| 'editprotected'
	| 'minoredit'
	| 'move'
	| 'move-categorypages'
	| 'move-rootuserpages'
	| 'move-subpages'
	| 'movefile'
	| 'reupload'
	| 'reupload-own'
	| 'reupload-shared'
	| 'sendemail'
	| 'upload'
	| 'upload_by_url'
	| 'autopatrol'
	| 'bigdelete'
	| 'block'
	| 'blockemail'
	| 'browsearchive'
	| 'changetags'
	| 'delete'
	| 'deletedhistory'
	| 'deletedtext'
	| 'deletelogentry'
	| 'deleterevision'
	| 'editcontentmodel'
	| 'editinterface'
	| 'editmyoptions'
	| 'editmyprivateinfo'
	| 'editmyusercss'
	| 'editmyuserjs'
	| 'editmyuserjsredirect'
	| 'editmyuserjson'
	| 'editmywatchlist'
	| 'editsitecss'
	| 'editsitejs'
	| 'editsitejson'
	| 'editusercss'
	| 'edituserjs'
	| 'edituserjson'
	| 'hideuser'
	| 'markbotedits'
	| 'mergehistory'
	| 'pagelang'
	| 'patrol'
	| 'patrolmarks'
	| 'protect'
	| 'rollback'
	| 'suppressionlog'
	| 'suppressrevision'
	| 'unblockself'
	| 'undelete'
	| 'userrights'
	| 'userrights-interwiki'
	| 'viewmyprivateinfo'
	| 'viewmywatchlist'
	| 'viewsuppressed'
	| 'deletechangetags'
	| 'import'
	| 'importupload'
	| 'managechangetags'
	| 'renameuser'
	| 'siteadmin'
	| 'unwatchedpages'
	| 'apihighlimits'
	| 'autoconfirmed'
	| 'bot'
	| 'ipblock-exempt'
	| 'nominornewtalk'
	| 'noratelimit'
	| 'override-export-depth'
	| 'suppressredirect'

/**
 * index.php?action= 后的参数
 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Parameters_to_index.php#Actions action列表}
 */
export type PageAction =
	| 'view'
	| 'watch'
	| 'unwatch'
	| 'delete'
	| 'revert'
	| 'rollback'
	| 'protect'
	| 'unprotect'
	| 'markpatrolled'
	| 'render'
	| 'purge'
	| 'edit'
	| 'submit'
	| 'editredlink'
	| 'history'
	| 'historysubmit'
	| 'raw'
	| 'credits'
	| 'info'
	| 'revisiondelete'

export const srcDistExtensionMap = {
	scss: 'css',
	css: 'css',
	ts: 'js',
	js: 'js',
	json: 'json',
}

export type GadgetMetaPage =
	| {
			/** 从源文件构建 */
			type: 'source'
			/** 源文件名，构建后将输出到[[MediaWiki:Gadget-<file_name>.<ext>]]中 */
			entry: `${string}.${keyof typeof srcDistExtensionMap}`
	  }
	| {
			/** 直接使用现有的 MediaWiki 页面 */
			type: 'existing'
			name: string
	  }

/**
 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Extension:Gadgets Gadgets扩展介绍}
 */
export interface GadgetMeta {
	/** wikitext，将会是[[MediaWiki:Gadget-<gadget_name>]]的内容，`undefined`则不创建 */
	description?: string
	/** 该 gadget 涉及的页面 */
	pages: NonEmptyTuple<GadgetMetaPage>
	/** 除非小工具仅包含样式，否则 ResourceLoader 是必需的 */
	withResourceLoader: boolean
	/** 是否默认启用 */
	defaultEnabled: boolean
	/**
	 * 这些模块将在此小工具的脚本执行之前加载。
	 * @example ['mediawiki.util', 'ext.gadget.parentgadget']
	 * @see {@linkcode peers}
	 */
	dependencies?: string[]
	/**
	 * 这些仅包含 CSS 的小工具将随此小工具一起加载。这些小工具将在任何 `dependencies` 之前加载，并且即使 JavaScript 被禁用，其样式也会被应用。
	 * @see {@linkcode dependencies}
	 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/ResourceLoader/Migration_guide_(users)#Gadget_peers 关于为什么需要`peers`的详情}
	 */
	peers?: string[]
	/** 在[[Special:参数设置]]中隐藏小工具
	 * @default false
	 */
	hidden?: boolean
	/** 使小工具仅在特定条件可用，未提供则在所有情况均可用 */
	availableFor?: {
		/**
		 * 仅对具有指定权限的用户提供该小工具（并在参数设置中可见）
		 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:User_rights#List_of_permissions 用户权限列表}
		 */
		rights?: NonEmptyTuple<UserRight>
		/**
		 * 仅对使用指定皮肤的用户启用小工具（并在参数设置中可见）
		 */
		skins?: NonEmptyTuple<string>
		/**
		 * 仅在指定的页面操作中可用
		 * @example ['edit', 'history'] // 仅在编辑页面和历史记录页面上加载小工具
		 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Parameters_to_index.php#Actions action列表}
		 */
		actions?: NonEmptyTuple<PageAction>
		/**
		 * 仅在指定分类中可用
		 */
		categories?: NonEmptyTuple<string>
		/**
		 * 仅在指定的命名空间中可用
		 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Namespace 命名空间介绍}
		 */
		namespaces?: NonEmptyTuple<number>
		/**
		 * 仅在具有指定内容模型的页面上可用
		 * @example ['wikitext']
		 */
		contentModels?: NonEmptyTuple<PageAction>
	}
	/**
	 * 将此小工具标记为“包模式（packaged）”
	 *
	 * 在此模式下仅第一个 JavaScript 资源会被执行，其他资源可以通过`require()`函数导入。还支持导入 JSON 页面。
	 * 而在默认模式下，所有资源被合并为一个脚本执行。
	 * @default false
	 * @see {@linkplain https://www.mediawiki.org/wiki/Special:MyLanguage/ResourceLoader/Migration_guide_(users)#Package_Gadgets 关于 package 的说明}
	 */
	packaged?: boolean
	/**
	 * 对于仅修改页面现有元素样式的模块，使用`'styles'`，这使 CSS 在 HTML 中被链入，而不是通过 JavaScript 加载。
	 *
	 * 若未填写，仅包含样式的小工具默认为`'styles'`，其他情况默认为`'general'`
	 */
	type?: 'styles' | 'general'
	/**
	 * 这些 {@linkplain https://doc.wikimedia.org/codex/latest/icons/overview.html Codex 图标}将随此小工具一起加载。它们可从包中生成的`icons.json`文件获取。
	 * @see {@linkplain https://doc.wikimedia.org/codex/latest/icons/all-icons.html#list-of-all-icons 所有图标列表}
	 */
	codexIcons?: string[]
	/**
	 * 使小工具可通过`?withgadget` URL查询参数加载
	 *
	 * 文档表示它允许不填或者填`=true`或`=false`，不知道为什么没做成 flag。因此这个值是`boolean | null`，而不是`boolean`
	 * @default null
	 */
	supportsUrlLoad?: boolean | null
}
