# Vocawiki前端代码库

[**Vocawiki**](https://voca.wiki)是一个基于[MediaWiki](https://www.mediawiki.org/wiki/MediaWiki)的百科网站。提交至本项目中的代码将会部署至Vocawiki站内或Cloudflare Worker，部署状态可见[MediaWiki:Deployment.json](https://voca.wiki/MediaWiki:Deployment.json)。

## 开发步骤

> [!TIP]
>
> 如果你刚入门，没有开发环境，请查阅[准备开发环境](docs/准备开发环境.md)。

1. 安装依赖：

   ```sh
   pnpm i
   ```

2. 如果你使用VS Code（不使用则可跳过，不认可以下内容也可跳过）：
   1. 进入工作区后会有通知推荐你安装以下扩展：TypeScript 7、Oxc、Tailwind CSS IntelliSense，建议安装。

   2. 将以下内容加入项目目录下的`.vscode/settings.json`（不存在则创建）中：

      <details>
      <summary>点击展开</summary>

      ```jsonc
      {
      	"files.associations": {
      		"*.css": "tailwindcss",
      		"*.css.txt": "css",
      		"*.js.txt": "javascript",
      	},
      	"tailwindCSS.experimental.configFile": "src/gadgets/(appearance)/(skin)/site-styles/index.css",
      	"[html]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[css]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[tailwindcss]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[javascript]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[javascriptreact]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[typescript]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[typescriptreact]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[markdown]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[json]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"[jsonc]": {
      		"editor.defaultFormatter": "oxc.oxc-vscode",
      	},
      	"js/ts.experimental.useTsgo": true,
      	"js/ts.tsdk.path": "node_modules/@typescript/native/lib",
      }
      ```

      > [理论上](https://code.visualstudio.com/docs/configure/settings#_multiple-language-specific-editor-settings)上面的语言键是可以合并的，比如`"[javascript][typescript]": { ... }`，但目前一合并就失效。
      >
      > 另外 microsoft/vscode#40233 什么时候好啊。

      </details>

3. 修改源代码。可用`pnpm run dev`实时预览对组件的开发（目前仅支持`src/templates`目录内的）。
4. 执行提交前的任务，确保没有报错：

   ```sh
   pnpm run before-commit
   ```

   此命令实际一次性完成了三个任务：
   1. 格式化代码：`pnpm run format`；
   2. 检查代码问题：`pnpm run lint`；
   3. 构建：`pnpm run build`，构建产物可在`out/`查看。

5. 提交（commit）、推送（push）更改。提交前须确保完成第4步。

## 项目架构

### TypeScript环境

项目包含两个TypeScript环境，它们覆盖的文件互不交叉，两个环境通过[`tsconfig.json`](./tsconfig.json)的project reference整合到一起。

- [`tsconfig.app.json`](./tsconfig.app.json)：供客户端（浏览器）使用，因此构建目标较低，需要注意浏览器兼容性；
- [`tsconfig.node.json`](./tsconfig.node.json)：供构建环境使用，可以尽情使用新特性和Node API。

用于客户端的代码须满足Vocawiki规定的浏览器兼容性要求，请查阅Vocawiki的[帮助:浏览器兼容性](https://voca.wiki/Help:浏览器兼容性)。若不确定某CSS或JS特性是否满足兼容性指标，可至[Can I use...](https://caniuse.com/)查询。

项目使用的构建工具会进行转译/语法降级，因此并不总是需要刻意写面向旧版浏览器的代码，具体而言：

- 可以在CSS中使用部分新特性，如嵌套语法，[Lightning CSS](https://lightningcss.dev/)会将其转译为兼容的代码，完整特性列表见[它的文档](https://lightningcss.dev/transpilation.html)。
- 可以且鼓励使用新的JS语法，[Rolldown](https://rolldown.rs/)会将其转译到兼容的语法。但是仅限语法，JS API不可以，不会自动polyfill。

### 目录结构

> [!NOTE]
>
> 下文圆括号`( )`是真实存在于目录和文件名称中的，不可省略。

- [`src/`](./src/)：用于站内的代码，详细结构见后续小节。
- [`scripts/`](./scripts/)：开发、构建、部署过程中需要用到的脚本，它们被[`package.json`](./package.json)的`scripts`字段使用；
- [`tools/`](./tools/)：包含了一些类型定义和统计函数，使`scripts/`能够获取一些位于`src/`中的信息。例如，`src/gadgets/<gadget名>/(meta).ts`导入了其中的模块，用于定义元数据，以供`scripts/build/`读取。
- [`lib/`](./lib/)：用于构建环境的可复用代码。
- `out/`：输出目录，可于此处检查构建后的页面内容。

#### `src/gadgets/`

- `(meta).ts`：定义了所有可用的gadget的分组、顺序，该文件的内容将部署到[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)。
- `(<类别>)/`：用于分组的目录，包含了任意个子类别或gadget目录。
- `(<0层或任意多层类别>)/<gadget名>/`：
  - `(meta).ts`：定义了该gadget的信息，用于[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)中属于该Gadget的一行。参见[GadgetMeta](tools\gadget\types.ts)的类型定义，文档注释写得很详细。

    该文件必须默认导出一个符合`GadgetMeta`的对象，示例内容：

    ```ts
    import type { GadgetMeta } from '@/tools/gadget'

    export default {
    	withResourceLoader: true,
    	defaultEnabled: false,
    	// ...
    } satisfies GadgetMeta
    ```

  - `<源代码文件>`：目前可以是TS/JS/Tailwind CSS文件，一般命名为`index.{ts,js,css}`，构建后将部署到“MediaWiki:Gadgets-`<gadget名>`.{js,css}”；若需其他名字，则需要在`./(meta).ts`中指定入口文件。

#### `src/widgets/`

- `<widget名>/`：将部署到“Widget:`<widget名>`”。
  - `(meta).ts`：定义了该widget的信息，必须默认导出一个符合`WidgetMeta`的对象，示例内容：

    ```ts
    import type { WidgetMeta } from '@/tools/widget'

    export default {
    	description: '...',
    	type: 'script',
    	scriptType: 'module',
    } satisfies WidgetMeta
    ```

  - `index.ts`：入口文件。

### `src/templates/`

- `<模板名>/`：将部署到“Template:`<模板名>`”。
  - `index.tsx`：入口文件，需要默认导出一个无参数的React组件，该组件的返回值将作为该模板的完整内容。

    若需要模板构建内容中出现wikitext，请<code>import * as Wiki from ['~/components/wikitext'](./src/components/wikitext/)</code>，再使用`<Wiki.Link page="...">...</Wiki.Link>`、`<Wiki.NoInclude>...</Wiki.NoInclude>`等，它们将变为`[[页面|显示文字]]`、`<noinclude>...</noinclude>`等。

## 提交消息

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)的结构，但具体约定什么还没定，可以按常见的来，放轻松。喜好单数，如“doc:”（文档）、“dep:”（依赖）而不是“docs:”、“deps:”——多出来的这“s”什么信息都提供不了。实在不知道写什么前缀的话不写也行。

## 问答

### 为什么要用tab缩进？

每个人喜好的缩进长度不同，正经的编辑器都可以设置tab宽度，使用tab缩进使得你能够将缩进设成你喜欢的宽度——用空格缩进则没法在不修改源代码的情况下做到。
