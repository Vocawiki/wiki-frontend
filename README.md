# Vocawiki前端代码库

## 开发步骤

1. 安装依赖：

   ```bash
   pnpm i
   ```

   Bun的包管理器bug太多了，不用。

2. 修改代码。
3. 格式化代码：

   ```bash
   pnpm run format
   ```

4. 检查代码问题：

   ```bash
   pnpm run test
   ```

5. 试构建：

   ```bash
   pnpm run build
   ```

6. 提交代码。提交前需确保完成3、4、5步。

## 文件夹说明

- `src`：用于站内的代码；
- `scripts`：开发、构建过程中需要用到的代码；
- `tools`：`src`、`scripts`共用的代码，其在`src`中用于定义元数据而不用于站内；
- `out`：输出文件夹。
