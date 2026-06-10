# create-vben

> **create-vben** 是从 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) Monorepo **按需提取单一 UI 模板** 的 npm CLI 脚手架工具，生成可独立安装、独立维护的 Vue 3 + Vite 后台管理项目。

**English:** [README.en.md](./README.en.md)

| 项目     | 说明                                                                   |
| -------- | ---------------------------------------------------------------------- |
| npm 包名 | [`create-vben-admin`](https://www.npmjs.com/package/create-vben-admin) |
| 上游真源 | [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)      |
| 适用框架 | Vue 3 · Vite · TypeScript · pnpm workspace                             |
| Node     | >= 20.11                                                               |

---

## 目录

- [这是什么](#这是什么)
- [适用场景](#适用场景)
- [快速开始](#快速开始)
- [支持的 UI 模板](#支持的-ui-模板)
- [CLI 选项](#cli-选项)
- [默认行为](#默认行为)
- [常见问题 FAQ](#常见问题-faq)
- [本仓库开发](#本仓库开发)
- [文档与链接](#文档与链接)

---

## 这是什么

[vben-admin](https://www.vben.pro)（**vue-vben-admin**）以 Monorepo 维护多套 UI 模板（`apps/web-*`）与大量共享包（`packages/`、`internal/`）。若你只需 **一种 UI 库** 的起步工程，不必 clone 整个 upstream 仓库。

**create-vben** 是一条命令的 **vben 脚手架生成器**：

1. 从 GitHub 拉取指定 upstream ref（默认最新 release tag）
2. 解析 pnpm workspace 依赖闭包
3. 只保留所选 `apps/web-*` 模板及其传递依赖
4. 输出 **扁平单应用仓库**（业务代码在根目录）
5. 自动执行 `pnpm install` 与 vendor 预构建

```
upstream Monorepo                    create-vben 生成物
─────────────────                    ─────────────────
apps/web-naive  ──提取──►            my-app/          ← 业务代码在根目录
packages/*      ──闭包──►            packages/        ← 构建所需 vendor
internal/*                           internal/
```

## 适用场景

| 适合                                                                | 不适合                                       |
| ------------------------------------------------------------------- | -------------------------------------------- |
| 只要 Ant Design Vue / Element Plus / Naive UI 等 **单一 vben 模板** | 需要同时维护 upstream 全部 `apps/web-*`      |
| 希望 **轻量本地仓库**，减少 Monorepo 认知成本                       | 需要与官方 Monorepo **完全等价** 的开发体验  |
| 锁定 upstream **tag / commit** reproducible 生成                    | 期望本工具替代官方 vben 文档或长期 fork 维护 |

## 快速开始

### 安装与运行

```bash
# 推荐：零安装（需 Node >= 20.11）
pnpm dlx create-vben-admin

# 非交互（目录名 → ~/Downloads/<name>）
pnpm dlx create-vben-admin my-vben-admin --template web-naive --no-mock

# 指定完整路径与 upstream 版本
pnpm dlx create-vben-admin ~/Downloads/my-vben-admin --template web-antd --ref v5.7.0 --force

# 全局安装
pnpm add -g create-vben-admin
create-vben-admin --help
```

交互时 **项目路径** 默认：`~/Downloads/my-vben-admin`（可改为任意绝对/相对路径）。

### 生成后启动

```bash
cd ~/Downloads/my-vben-admin
pnpm dev
```

开发端口由生成物 `.env.development` 的 `VITE_PORT` 控制（upstream 默认 **5888**，非 5173）。

## 支持的 UI 模板

| 模板 ID `--template` | UI 库               | upstream 路径         |
| -------------------- | ------------------- | --------------------- |
| `web-antd`           | Ant Design Vue      | `apps/web-antd`       |
| `web-ele`            | Element Plus        | `apps/web-ele`        |
| `web-naive`          | Naive UI            | `apps/web-naive`      |
| `web-tdesign`        | TDesign             | `apps/web-tdesign`    |
| `web-antdv-next`     | Ant Design Vue Next | `apps/web-antdv-next` |

## CLI 选项

| 选项             | 说明                                                                        |
| ---------------- | --------------------------------------------------------------------------- |
| `[project-path]` | 绝对路径、相对路径，或目录名（→ `~/Downloads/<name>`）                      |
| `-t, --template` | UI 模板 ID（见上表）                                                        |
| `-r, --ref`      | upstream git ref（tag / branch / commit）；默认 **最新 GitHub release tag** |
| `--mock`         | 包含 `apps/backend-mock`（Nitro Mock 服务）                                 |
| `--no-mock`      | 不包含 mock（默认；非交互时跳过询问）                                       |
| `--offline`      | 仅使用本地 upstream 缓存                                                    |
| `--force`        | 覆盖非空目标目录                                                            |
| `--dry-run`      | 只解析生成计划，不写文件                                                    |

## 默认行为

| 项           | 说明                                                           |
| ------------ | -------------------------------------------------------------- |
| 输出布局     | 单 package 扁平（app 在根，`packages/` / `internal/` 保留）    |
| upstream ref | 最新 release tag（`--ref` 可覆盖）                             |
| backend-mock | **默认不包含**；`--mock` 或交互确认时包含                      |
| OpenAPI      | **始终**从 upstream 生成 `docs/mock-api.openapi.json` 接口参考 |
| 生成后       | 自动 `pnpm install` + workspace stub（失败则整次生成失败）     |
| 缓存目录     | `~/.create-vben-cache/`（环境变量 `CREATE_VBEN_CACHE` 可覆盖） |

## 常见问题 FAQ

### create-vben 和直接 clone vue-vben-admin 有什么区别？

clone 会得到 **完整 Monorepo**（所有 UI 模板与工具链）；create-vben 只提取 **一个** `apps/web-*` 及其 workspace 依赖，输出更小的独立项目。

### 支持哪些包管理器安装本 CLI？

发布在 npm 上，可用 `pnpm dlx`、`pnpm add -g` 或 `npm i -g create-vben-admin`。生成物默认使用 **pnpm**（与 upstream 一致）。

### 默认 development 端口是多少？

读取生成物 `.env.development` 中的 `VITE_PORT`，upstream 当前默认 **5888**。请以终端实际输出为准。

### 是否包含 mock 后端？

默认 **不包含** `apps/backend-mock`。交互时可选择 `--mock` 包含；不含 mock 时仍会生成 OpenAPI 参考文档供 Apifox / Postman 导入。

### 如何指定 vben 版本？

使用 `--ref`，例如 `--ref v5.7.0` 或具体 commit SHA。默认取 GitHub **最新 release tag**。

### 生成失败 / `pnpm dev` 起不来怎么办？

请用最新版 CLI 重新 `--force` 生成。旧生成物若缺少 `@vben/vite-config/dist` 等 vendor 构建产物，需重新跑完 create-vben 的 install + stub 流程。

### 这是官方 vben 发行版吗？

**不是。** 生成物 README 会注明 upstream ref 与 create-vben 版本；这是社区维护的提取工具，非 vbenjs 官方 npm 包。

## 本仓库开发

| 命令           | 说明                                     |
| -------------- | ---------------------------------------- |
| `pnpm install` | 安装依赖                                 |
| `pnpm dev`     | 本地运行 CLI（tsx）                      |
| `pnpm verify`  | format · typecheck · lint · test · build |
| `pnpm build`   | 构建 `dist/` 供 npm 发布                 |

**环境：** Node >= 20.11 · pnpm · 手动生成物请写入 `.temp/generated/`（已 gitignore）。

## 文档与链接

| 文档                                                                     | 用途                           |
| ------------------------------------------------------------------------ | ------------------------------ |
| [`docs/decisions/npm-publish.md`](docs/decisions/npm-publish.md)         | npm 发布与 GitHub Release      |
| [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md) | 里程碑开发指南                 |
| [`docs/decisions/`](docs/decisions/)                                     | 架构 / Git / upstream 同步 ADR |
| [`AGENTS.md`](AGENTS.md)                                                 | Cursor Agent 入口              |

**链接**

- 仓库：[github.com/379949990/create-vben](https://github.com/379949990/create-vben)
- upstream：[vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- Vben 官方文档：[doc.vben.pro](https://doc.vben.pro/)

## License

MIT
