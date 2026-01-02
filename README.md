# Vocawiki前端代码库

## 开发步骤

<details>

<summary>如果你没有开发环境……（点击展开）</summary>

> 以下教程面向的是纯小白，如果你有不同见解，按你的方法做既可。

1. [安装Git](https://git-scm.com/downloads)。如果你不使用Git Bash，你需要将可执行文件`git`加入PATH环境变量。

2. [安装Node.js](https://nodejs.org/zh-cn/download)。

   > Windows用户注意不要被上面的Docker吓住了，下载下面的“Windows 安装程序(.msi)”或“独立文件(.zip)”（后者需要手动设置PATH环境变量）。

3. [安装Visual Studio Code](https://code.visualstudio.com/Download)。

4. 克隆仓库：

   ```sh
   git clone https://github.com/Vocawiki/wiki-frontend.git vocawiki-frontend
   ```

   或使用可视化工具克隆，如Visual Studio Code、GitHub Desktop。

5. 安装包管理器pnpm。在项目根目录运行：

   ```sh
   corepack install
   ```

   即可安装。

   > `corepack`为Node.js自带，若系统未找到该命令，请检查Node.js安装选项，以及是否加入PATH。

</details>

1. 安装依赖：

   ```sh
   pnpm i
   ```

   > Bun的包管理器bug太多了，暂时不用。

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
