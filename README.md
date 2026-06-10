# create-vben

> 从 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) Monorepo **按需提取**单一 UI 库脚手架，生成可独立维护的本地项目。

**English:** [README.en.md](./README.en.md)

---

## 这是什么

[vben-admin](https://www.vben.pro) 以 Monorepo 维护多套 UI 模板（`apps/web-*`）与大量共享包（`packages/`、`internal/`）。若你只需 **一种 UI 库** 的起步工程，不必 clone 整个 upstream。

**create-vben** 是 npm CLI：拉取指定 upstream ref → 解析 pnpm workspace 依赖图 → 只保留所选模板及其传递依赖 → 输出 **扁平单应用仓库**，生成后自动 `pnpm install`。

```
upstream Monorepo                    create-vben 生成物
─────────────────                    ─────────────────
apps/web-naive  ──提取──►            my-app/          ← 业务代码在根目录
packages/*      ──闭包──►            packages/        ← 构建所需 vendor
internal/*                           internal/
```

## 快速开始

```bash
# 推荐：npx 零安装
npx create-vben

# 非交互（名称默认生成在 ~/Downloads/<name>）
npx create-vben my-vben-admin --template web-naive

# 指定完整路径
npx create-vben ~/Downloads/my-vben-admin --template web-antd --ref v5.7.0

# 全局安装
npm i create-vben -g
create-vben
```

交互时 **项目路径** 默认：`~/Downloads/my-vben-admin`（可修改为任意绝对路径）。

生成完成后：

```bash
cd ~/Downloads/my-vben-admin
pnpm dev
```

## 支持的 UI 模板

| 模板 ID          | UI 库               | upstream 路径         |
| ---------------- | ------------------- | --------------------- |
| `web-antd`       | Ant Design Vue      | `apps/web-antd`       |
| `web-ele`        | Element Plus        | `apps/web-ele`        |
| `web-naive`      | Naive UI            | `apps/web-naive`      |
| `web-tdesign`    | TDesign             | `apps/web-tdesign`    |
| `web-antdv-next` | Ant Design Vue Next | `apps/web-antdv-next` |

## CLI 选项

| 选项             | 说明                                                   |
| ---------------- | ------------------------------------------------------ |
| `[project-path]` | 绝对路径、相对路径，或目录名（→ `~/Downloads/<name>`） |
| `-t, --template` | UI 模板 ID                                             |
| `-r, --ref`      | upstream ref；默认 **最新 GitHub release tag**         |
| `--offline`      | 仅使用本地缓存                                         |
| `--mock`         | 包含 `apps/backend-mock`（Nitro Mock）                 |
| `--no-mock`      | 不包含 mock（默认；非交互时跳过询问）                  |
| `--force`        | 覆盖非空目标目录                                       |
| `--dry-run`      | 只解析计划，不写文件                                   |

## 默认行为

| 项           | 说明                                                                 |
| ------------ | -------------------------------------------------------------------- |
| 输出布局     | 单 package 扁平（app 在根，`packages/` / `internal/` 保留）          |
| upstream ref | 最新 release tag（可用 `--ref` 覆盖）                                |
| backend-mock | **默认不包含**；`--mock` 或交互确认时包含；始终生成 OpenAPI 接口参考 |
| 生成后       | 自动执行 `pnpm install`                                              |
| 缓存         | `~/.create-vben-cache/`（`CREATE_VBEN_CACHE` 可覆盖）                |

## 本仓库开发

| 命令           | 说明                                     |
| -------------- | ---------------------------------------- |
| `pnpm install` | 安装依赖                                 |
| `pnpm dev`     | 本地运行 CLI（tsx）                      |
| `pnpm verify`  | format · typecheck · lint · test · build |
| `pnpm build`   | 构建 `dist/` 供 npm 发布                 |

**环境：** Node >= 20.11 · pnpm · 生成物默认 pnpm（与 upstream 一致）

手动/测试生成物请写入 **`.temp/generated/`**（已 gitignore）。

## 文档

| 文档                                                                     | 用途                           |
| ------------------------------------------------------------------------ | ------------------------------ |
| [`AGENTS.md`](AGENTS.md)                                                 | Cursor Agent 入口              |
| [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md) | 里程碑分步计划                 |
| [`docs/decisions/`](docs/decisions/)                                     | 架构 / Git / upstream 同步 ADR |

## Git 分支

- **集成：** `dev` · **当前开发：** `v1.0.0`
- 日常 commit 在版本分支；勿直接向 `main` / `dev` 提交

详见 [`docs/decisions/git-workflow.md`](docs/decisions/git-workflow.md)。

## 链接

- 仓库：[github.com/379949990/create-vben](https://github.com/379949990/create-vben)
- upstream：[vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- 官方文档：[doc.vben.pro](https://doc.vben.pro/)

## License

MIT
