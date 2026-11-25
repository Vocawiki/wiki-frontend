# Vocawiki前端代码库

[**Vocawiki**](https://voca.wiki)是一个基于[MediaWiki](https://www.mediawiki.org/wiki/MediaWiki)的百科网站。提交至本项目中的代码将会部署至Vocawiki站内或Cloudflare Worker，部署状态可见[MediaWiki:Deployment.json](https://voca.wiki/MediaWiki:Deployment.json)。

## 开发步骤

> [!TIP]
>
> 如果你刚入门，没有开发环境，请查阅《[准备开发环境](docs/准备开发环境.md)》。

1. 安装依赖：

   ```sh
   pnpm i
   ```

2. 如果你使用VS Code（不使用则可跳过，不认可以下内容也可跳过）：
   1. 进入工作区后会有通知推荐你安装以下扩展：TypeScript 7、Oxc、Tailwind CSS IntelliSense，建议安装。

   2. 将[examples/vscode-workspace-settings.json](examples/vscode-workspace-settings.json)的内容放入项目目录下的`.vscode/settings.json`（不存在则创建）中。

      > [!NOTE]
      >
      > [理论上](https://code.visualstudio.com/docs/configure/settings#_multiple-language-specific-editor-settings)这里的语言键是可以合并的，比如`"[javascript][typescript]": { ... }`，但目前一合并就失效。
      >
      > 另外 microsoft/vscode#40233 什么时候好啊。
3. 修改源代码。可用`pnpm run dev`实时预览对组件的开发（目前仅支持`src/templates`目录内的）。
4. 执行提交前的任务，确保没有报错：

   ```sh
   pnpm run preflight
   ```

   此命令实际一次性完成了三个任务：
   1. 格式化代码：`pnpm run format`；
   2. 检查代码问题：`pnpm run lint`；
   3. 构建：`pnpm run build`，构建产物可在`out/`查看。

5. 提交（commit）、推送（push）更改。提交前须确保完成第4步。

## TypeScript环境

项目包含两个TypeScript环境，它们覆盖的文件互不交叉，两个环境通过[`tsconfig.json`](tsconfig.json)的project reference整合到一起。

- [`tsconfig.app.json`](tsconfig.app.json)：供客户端（浏览器）使用，须满足Vocawiki规定的[浏览器兼容性要求](#浏览器兼容性)；
- [`tsconfig.node.json`](tsconfig.node.json)：供构建环境使用，使用Node 26，可以尽情使用新特性和Node API。

导入别名（`compilerOptions.paths`）请分别查看两个tsconfig文件。

开发时，请检查[`package.json`](package.json)有没有能满足需求的包，或项目中有没有已实现的代码，切忌重复造轮子。手搓并不总是加分项，如果确有必要，更欢迎引入成熟的、受维护的包。

## CSS

本项目使用Tailwind CSS。[src/theme.css](src/theme.css)定义了`@theme`、`@custom-variant`、`@utility`等，详阅《[项目所配置的Tailwind CSS](docs/项目所配置的Tailwind%20CSS.md)》。对于项目已经定义的variant和utility，请务必优先使用它们，例如，使用`flex-center`而不是`flex items-center justify-center`。

## 目录结构

> [!NOTE]
>
> 下文圆括号`( )`是真实存在于目录和文件名称中的，不可省略。

- [`src/`](src)：用于站内的代码，详细结构见后续小节。
- [`scripts/`](scripts)：开发、构建、部署过程中需要用到的脚本，它们被[`package.json`](package.json)的`scripts`字段使用；
- [`tools/`](tools)：包含了一些类型定义和统计函数，使`scripts/`能够获取一些位于`src/`中的信息。例如，`src/gadgets/<gadget名>/(meta).ts`导入了其中的模块，用于定义元数据，以供`scripts/build/`读取。
- [`lib/`](lib)：用于构建环境的可复用代码。
- `out/`：输出目录，可于此处检查构建后的页面内容，见后续小节。

### [`src/gadgets/`](src/gadgets)

- [`(meta).ts`](<src/gadgets/(meta).ts>)：定义了所有可用的gadget的分组、顺序，该文件的内容将部署到[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)。
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

  - `<源代码文件>`：目前可以是TS/JS/Tailwind CSS文件，一般命名为`index.{ts,js,css}`，构建后将部署到“MediaWiki:Gadgets-`<gadget名>`.{js,css}”；若需其他名字，则需要在同一目录下的`(meta).ts`中指定入口文件。

### [`src/embeddable-html/`](src/embeddable-html)

- `<片段名>/`：将部署到“HTML:`<片段名>`”。
  - `(meta).ts`：定义了该的信息，必须默认导出一个符合[`EmbeddableHtmlMeta`](tools/embeddable-html/index.ts)的对象，示例内容：

    ```ts
    import type { EmbeddableHtmlMeta } from '@/tools/embeddable-html'

    export default {
    	type: 'static-markup',
    	position: 'in-place',
    } satisfies EmbeddableHtmlMeta
    ```

  - `index.{tsx,ts}`：入口文件：

    | `EmbeddableHtmlMeta`的`type` | 入口文件后缀 | 说明                                                              |
    | ---------------------------- | ------------ | ----------------------------------------------------------------- |
    | `static-markup`              | `tsx`        | 需要默认导出一个React组件，组件返回值将作为HTML内容。             |
    | `script`                     | `ts`         | 构建后的脚本作为`<script>`的`src`或内容，取决于meta的`scriptType` |

    对`static-markup`的额外说明：可在`index.tsx`导出一个`getStaticProps`函数，作用和用法均类似于Next.js的同名函数。（[用法示例](<src/embeddable-html/(global)/global-head/index.tsx>)）

### [`src/templates/`](src/templates)

- `<模板名>/`：将部署到“Template:`<模板名>`”。
  - `index.tsx`：入口文件，需要默认导出一个无参数的React组件，该组件的返回值将作为该模板的完整内容。

    若需要模板构建内容中出现wikitext，请使用[wikitext组件库](#wikitext组件库)。

### [`src/components/`](src/components)

可能被多处使用的React组件。

#### wikitext组件库

wikitext组件库位于['src/components/wikitext/'](src/components/wikitext)，它在开发预览时渲染为HTML，构建时则变为wikitext。用法：

```tsx
import * as Wiki from '~/components/wikitext'

// [[页面]]
<Wiki.Link>页面</Wiki.Link>

// [[页面|显示文字]]
<Wiki.Link page="页面">显示文字</Wiki.Link>

// <noinclude>...</noinclude>
<Wiki.NoInclude>...</Wiki.NoInclude>
```

所有受支持的wikitext见[index.ts](src/components/wikitext/index.ts)。

### `out/`

- `assets/`：要部署到Cloudflare Worker的静态资源（CSS、JS等），名称带hash，客户端缓存一年。通过`https://voca.wiki/assets/*`访问。
- `pages/`：要部署到MediaWiki各个页面的文件，文件名格式为`转义后的标题（含命名空间）.txt`，转义规则见[`escapePageTitle`](scripts/utils/page.ts)。
- `nondefault-content-models.json`：不采用默认内容模型的页面。
- `referenced-files.txt`：通过`[[File:文件名]]`之外的方式用到的文件，以供追踪。

#### 设计细节

由于MediaWiki限制过多，项目正在逐渐摆脱对MediaWiki的依赖，更偏向于将文件部署到Cloudflare Worker的静态资源中。静态资源通过hash区分版本，使得超长缓存成为可能，用户体验比MediaWiki上的文件更优。我们不依赖Worker运行时，仅使用其静态存储，理论上可以换成任意一家静态资源提供商。

为了和MediaWiki功能衔接——例如可供用户开关的gadget、可供嵌入的模板——不少文件不可避免地仍需部署到MediaWiki上。但是仍有办法减轻对MW的依赖，例如把chunk部署到静态资源，仅入口部署到MW，从入口导入这些chunk。

## 浏览器兼容性

用于客户端的代码须满足下表所示的兼容性要求。开发者**可以**引入只有新版本浏览器才支持的特性，但是需要为较低版本浏览器提供最基本的可用性。低于“最基础的体验所需版本”的浏览器**不需要**支持。

| 代表浏览器（引擎） | 完整体验所需版本 | 最基础的体验所需版本 |
| ------------------ | ---------------- | -------------------- |
| Chrome（Blink）    | 最新版本         | 109（2023年1月）     |
| Safari（Webkit）   | 最新版本         | 16.4（2023年3月）    |
| Firefox（Gecko）   | 最新版本         | 115（2023年7月）     |

若不确定某CSS或JS特性是否满足兼容性指标，可至[Can I use...](https://caniuse.com/)查询。

项目使用的构建工具会进行转译/语法降级，因此并不总是需要刻意写面向旧版浏览器的代码，具体而言：

- 可以在CSS中使用部分新特性，[Lightning CSS](https://lightningcss.dev/)会将其转译为兼容的代码，完整特性列表见[它的文档](https://lightningcss.dev/transpilation.html)。其中，嵌套语法是**鼓励使用**的。
- 可以且**鼓励使用**新的JS语法，[Rolldown](https://rolldown.rs/)会将其转译到兼容的语法。但是仅限语法，API不可以，不会自动polyfill。

## 提交消息

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)的结构，但具体约定什么还没定，可以按常见的来。喜好单数，如“doc:”（文档）而不是“docs:”——多出来的“s”什么有用的信息都没提供。实在不知道写什么前缀的话不写也行。

## 问答

### 为什么要用tab缩进？

每个人喜好的缩进长度不同，正经的编辑器都可以设置tab宽度，使用tab缩进使得你能够将缩进设成你喜欢的宽度——用空格缩进则没法在不修改源代码的情况下做到。
