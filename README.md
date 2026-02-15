# Vocawiki前端代码库

## 开发步骤

> [!TIP]
>
> 如果你没有开发环境，请查阅[准备开发环境](docs/准备开发环境.md)。

1. 安装依赖：

   ```sh
   pnpm i
   ```

2. 修改代码。

3. 执行提交前的任务，确保没有报错：

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

4. 提交、推送代码。提交前需确保完成第3步。

## 项目结构

- `src/`：用于站内的代码。
  - `gadgets/`：
    - `(meta).ts`：定义了所有可用的gadget的分组、顺序，将部署到\[\[[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)\]\]。
    - `<gadget名>/`
      - `(meta).ts`：定义了该gadget的信息，用于\[\[[MediaWiki:Gadgets-definition](https://voca.wiki/MediaWiki:Gadgets-definition)\]\]中属于该Gadget的一行。参见[GadgetMeta](tools\gadget\types.ts)的类型定义，文档注释写得很详细。
      - `<源代码文件>`：目前可以是SCSS/JS/TS文件，入口文件需要在`./(meta).ts`中指定。
  - `widgets/`：
    - `<widget名>/`：将部署到\[\[Widget:`<widget名>`\]\]。
      - `(meta).ts`：定义了该widget的信息。
      - `index.ts`：源代码，可以导入其他文件，将被打包至单个文件。
- `scripts/`：开发、构建、部署过程中需要用到的脚本；
- `tools/`：`src`、`scripts`共用的代码。它在`src`中用于定义元数据，例如gadget的`(meta).ts`就导入了其中的模块。
- `out/`：输出文件夹，可于此处检查构建后的页面内容。
