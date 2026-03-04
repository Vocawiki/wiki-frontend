# Vocawiki前端代码库

## 开发步骤

> [!TIP]
>
> 如果你刚入门，没有开发环境，请查阅[准备开发环境](docs/准备开发环境.md)。

1. 安装依赖：

   ```sh
   pnpm i
   ```

2. 如果你使用VS Code（不使用则可跳过，不认可以下内容也可跳过）：
   1. 进入工作区后会有通知推荐你安装以下扩展：ESLint、Oxc、Tailwind CSS IntelliSense，建议安装。

   2. 将以下内容加入`.vscode/settings.json`（不存在则创建）中：
      ```jsonc
      {
      	"files.associations": {
      		"**/src/**/*.css": "tailwindcss",
      		"*.css.txt": "css",
      		"*.js.txt": "javascript",
      	},
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
      }
      ```
      [理论上](https://code.visualstudio.com/docs/configure/settings#_multiple-languagespecific-editor-settings)上面的语言键是可以合并的，比如`"[javascript][typescript]": { ... }`，但目前合并了没法生效。

3. 修改源代码。
4. 执行提交前的任务，确保没有报错：

   ```sh
   pnpm run before-commit
   ```

   此命令实际一次性完成了三个任务：
   1. 格式化代码：

      ```sh
      pnpm run format
      ```

   2. 检查代码问题：

      ```sh
      pnpm run check
      ```

   3. 尝试构建：

      ```sh
      pnpm run build
      ```

5. 提交、推送代码。提交前需确保完成第4步。

## 项目结构

- `src/`：用于站内的代码。
  - `gadgets/`：
    - `(meta).ts`：定义了所有可用的gadget的分组、顺序，将部署到\[\[[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)\]\]。
    - `<gadget名>/`
      - `(meta).ts`：定义了该gadget的信息，用于\[\[[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)\]\]中属于该Gadget的一行。参见[GadgetMeta](tools\gadget\types.ts)的类型定义，文档注释写得很详细。
      - `<源代码文件>`：目前可以是Tailwind CSS/JS/TS文件，入口文件需要在`./(meta).ts`中指定。
  - `widgets/`：
    - `<widget名>/`：将部署到\[\[Widget:`<widget名>`\]\]。
      - `(meta).ts`：定义了该widget的信息。
      - `index.ts`：源代码，可以导入其他文件，将被打包至单个文件。
- `scripts/`：开发、构建、部署过程中需要用到的脚本；
- `tools/`：`src`、`scripts`共用的代码。它在`src`中用于定义元数据，例如gadget的`(meta).ts`就导入了其中的模块。
- `out/`：输出文件夹，可于此处检查构建后的页面内容。

## 浏览器兼容性

开发者需要注意`src`文件夹内的代码须满足Vocawiki规定的浏览器兼容性要求，请查阅[Vocawiki 帮助:浏览器兼容性](Help:浏览器兼容性)。

- JS语法可以使用最新语法，[Rolldown](https://github.com/rolldown/rolldown)会将其转译到兼容的语法。
- 但是，JS API不行，不会自动polyfill。

## 问答

### 为什么要用tab缩进？

每个人喜好的缩进长度不同，正经的编辑器都可以设置tab宽度，使用tab缩进使得你能够将缩进设成你喜欢的宽度——用空格缩进则没法在不修改源代码的情况下做到。
