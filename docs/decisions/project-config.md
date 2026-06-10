# 已确认配置 — create-vben

> 负责人确认后写入；未列项 = **尚未确认**，须先询问。

| 字段                 | 值                                            | 确认日期   |
| -------------------- | --------------------------------------------- | ---------- |
| npm 包名 / 发布      | `create-vben-admin` · GitHub Actions tag 发版 | 2026-06-10 |
| CLI bin              | `create-vben-admin`                           | 2026-06-10 |
| **集成分支**         | **`dev`**（merge 后 push 触发 CI）            | 2026-06-10 |
| **当前工作分支**     | **`v1.0.0`**（仅版本分支开发）                | 2026-06-10 |
| **发版 Tag 命名**    | **`Version_X.Y.Z`**（如 `Version_1.0.0`）     | 2026-06-10 |
| **版本开发分支命名** | **`vX.Y.Z(-*)(_*)`**                          | 2026-06-09 |
| upstream             | `vbenjs/vue-vben-admin`                       | 2026-06-09 |
| Node engines         | `>=20.11.0`                                   | 2026-06-09 |
| 本仓库包管理         | pnpm                                          | 2026-06-09 |
| 生成物包管理         | pnpm（与 upstream 一致）                      | 2026-06-09 |

Git：[`git-workflow.md`](git-workflow.md) · upstream：[`vben-source-sync.md`](vben-source-sync.md) · 架构：[`architecture.md`](architecture.md)

## 工具链

| 项         | 值                       |
| ---------- | ------------------------ |
| Node       | **>= 20.11.0**           |
| TypeScript | 5.x                      |
| 构建       | tsup → ESM `dist/`       |
| 测试       | Vitest                   |
| Lint       | ESLint 9 flat + Prettier |

## 维护命令

```bash
pnpm install
pnpm verify          # 合并前全量门禁
pnpm dev             # tsx 调试 CLI
pnpm dev -- --help
```

## 待确认（见 dev-guide Q\*）

| 项                                      | 状态                                                                |
| --------------------------------------- | ------------------------------------------------------------------- |
| 生成物目录结构（扁平 vs mini-monorepo） | ⬜ Q1                                                               |
| 默认 upstream ref                       | ⬜ Q2                                                               |
| npm scope / 发布账号                    | ✅ Q4 · `create-vben-admin` · `fluoxetine_` · Actions + `NPM_TOKEN` |
| 生成后自动 install                      | ⬜ Q5                                                               |

---

_确认后更新本表与 dev-guide §5。_
