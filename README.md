# create-vben

> 从 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) Monorepo **按需提取**单一 UI 库脚手架，生成可独立维护的本地项目。

## 背景

[vben-admin](https://www.vben.pro) 是功能完善的后台模板，但 upstream 以 **Monorepo** 维护（`apps/` 下 4–5 套 UI 模板 + 大量 `packages/` 共享包）。对维护者 Monorepo 是合理选择；对使用者往往只需要 **一种 UI 库** 的基础工程。

**create-vben** 作为 npm CLI，从 GitHub 拉取 upstream 最新结构，解析 workspace 依赖图，**只保留所选模板及其 transitive 依赖**，输出扁平化、可 `pnpm install && pnpm dev` 的独立项目。

## 使用方式（目标态）

```bash
# 全局安装
npm i create-vben -g
create-vben my-app

# 或 npx（推荐）
npx create-vben my-app

# 非交互
npx create-vben my-app --template web-antd --ref v5.7.0
```

> **当前状态：** v0.0.0 脚手架阶段 — CLI 入口与规范已就绪，生成管线见 [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md)。

## 支持的 UI 模板

| 模板 ID          | UI 库               | upstream 路径         |
| ---------------- | ------------------- | --------------------- |
| `web-antd`       | Ant Design Vue      | `apps/web-antd`       |
| `web-ele`        | Element Plus        | `apps/web-ele`        |
| `web-naive`      | Naive UI            | `apps/web-naive`      |
| `web-tdesign`    | TDesign             | `apps/web-tdesign`    |
| `web-antdv-next` | Ant Design Vue Next | `apps/web-antdv-next` |

## 开发

| 命令           | 说明                                     |
| -------------- | ---------------------------------------- |
| `pnpm install` | 安装依赖                                 |
| `pnpm dev`     | 本地运行 CLI（tsx）                      |
| `pnpm verify`  | format · typecheck · lint · test · build |
| `pnpm build`   | 构建 `dist/` 供 npm publish              |

**Node：** >= 20.11.0 · **包管理：** pnpm（本仓库） · 生成物默认 pnpm（与 upstream 一致）

## 文档

| 文档                                                                     | 用途                           |
| ------------------------------------------------------------------------ | ------------------------------ |
| [`AGENTS.md`](AGENTS.md)                                                 | Cursor Agent 入口              |
| [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md) | 里程碑分步计划与进度           |
| [`docs/decisions/`](docs/decisions/)                                     | 架构 / Git / upstream 同步决策 |

## Git 分支

- **集成分支：** `dev`
- **当前工作分支：** `v1.0.0`（自 `dev` 切出）
- 日常 commit 在版本开发分支；**禁止**向 `main` / `dev` 直接提交

详见 [`docs/decisions/git-workflow.md`](docs/decisions/git-workflow.md)。

## License

MIT
