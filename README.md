# Vocawiki前端代码库

## 开发步骤

<details>
<summary>如果你没有开发环境</summary>

> [!NOTE]
> 以下教程面向的是纯小白，如果你有不同见解，按你的方法做既可。

1. [安装Node.js](https://nodejs.org/zh-cn/download)

   > Windows用户注意不要被上面的Docker唬住了，下载下面的“Windows 安装程序(.msi)”或“独立文件(.zip)”（后者需要手动设置Path）。

2. 在项目根目录运行：

   ```sh
   corepack install
   ```

</details>

1. 安装依赖：

   ```sh
   pnpm i
   ```

   Bun的包管理器bug太多了，不用。

2. 修改代码。
3. 格式化代码：

   ```sh
   pnpm run format
   ```

4. 检查代码问题：

   ```sh
   pnpm run test
   ```

5. 试构建：

   ```sh
   pnpm run build
   ```

6. 提交代码。提交前需确保完成3、4、5步。

## 文件夹说明

- `src`：用于站内的代码；
- `scripts`：开发、构建过程中需要用到的代码；
- `tools`：`src`、`scripts`共用的代码，其在`src`中用于定义元数据；
- `out`：输出文件夹。
