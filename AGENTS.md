# AGENTS.md — create-vben-admin

> **受众：** Cursor Agent / 自动化。人类 onboarding 见 [`README.md`](README.md)。  
> **权威规范：** [`.cursor/rules/create-vben-core.mdc`](.cursor/rules/create-vben-core.mdc) · 当前里程碑 [`docs/versions/v1.0.0/`](docs/versions/v1.0.0/)

| 字段                 | 值                                                                            |
| -------------------- | ----------------------------------------------------------------------------- |
| 包名                 | `create-vben-admin`（npm）                                                    |
| GitHub               | [379949990/create-vben-admin](https://github.com/379949990/create-vben-admin) |
| 类型                 | **Node.js CLI**（ESM · TypeScript · tsup）                                    |
| **上游真源**         | [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)             |
| **工具链**           | Node **>= 20.11** · pnpm · TypeScript 5.x · Vitest                            |
| 应用版本             | `1.0.1`（`package.json`）                                                     |
| **集成分支**         | **`dev`**                                                                     |
| **当前工作分支**     | **`v1.0.1`**                                                                  |
| **发版 Tag 命名**    | **`Version_X.Y.Z`**（如 `Version_1.0.1`）                                     |
| **版本开发分支命名** | **`vX.Y.Z(-*)(_*)`**                                                          |
| 锚点分支             | `main` · `dev`（**禁止**日常 commit）                                         |
| Git 规范             | [`docs/decisions/git-workflow.md`](docs/decisions/git-workflow.md)            |
| 已确认配置           | [`docs/decisions/project-config.md`](docs/decisions/project-config.md)        |
| 第一原则             | 最小正确 diff · 与 upstream 结构同步 · 不臆造 vben 目录/依赖                  |

---

## 0. 工作流（始终遵循）

**有不清楚的先询问 → 设计/规划 → 分步开发 → 验证/修复 → 下一步**（详见 Core 规范）。

| 阶段            | 动作                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **询问**        | upstream 目录变更、模板列表、发布策略、npm 包名等 **未确认必须先问**                           |
| **设计/规划**   | 对照 [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md) CV1-\* 步骤      |
| **分步开发**    | 最小 diff；一步一主题；**仅在版本分支**（如 **`v1.0.1`**）开发，**禁止**在 `dev`/`main` 改代码 |
| **集成**        | merge 版本分支 → **`dev`** → **`git push origin dev`** 触发 CI                                 |
| **验证/修复**   | `pnpm format:check` · `pnpm typecheck` · `pnpm lint` · `pnpm test` · `pnpm build`              |
| **提交**        | **仅负责人验证后** commit；一步一 commit；**禁止** Agent 自行提交                              |
| **Commit 信息** | **禁止** `Co-authored-by: Cursor <cursoragent@cursor.com>`                                     |

---

## 1. Agent 启动（~60s）

1. **读：** 本文 → Core 规范 → dev-guide §0–§4、§7（下一步）。
2. **确认分支：** `git branch --show-current` 须为 **版本分支**（当前 **`v1.0.1`** 或下级 `v1.0.1_*`），**非** `dev` / `main`。
3. **跑：** `pnpm install` → `pnpm verify`。
4. **改：** 涉及 upstream 结构时 **先** 读 [`docs/decisions/vben-source-sync.md`](docs/decisions/vben-source-sync.md) 与官方 [目录说明](https://doc.vben.pro/guide/project/dir.html)。
5. **交：** verify 全通过；更新 dev-guide 进度表。

---

## 2. 架构快照（CLI）

```text
src/index.ts                    # shebang 入口 → runCli
  → cli/                        # commander + @clack/prompts 交互
  → generate/create-project     # 编排：fetch → parse → resolve → write
  → extract/                    # upstream 拉取、workspace 解析、依赖图
  → core/constants              # 模板 ID、upstream 元信息
templates/                      # 生成后补丁（.gitignore、README 片段等，可选）
```

| 路径            | 职责                                                 |
| --------------- | ---------------------------------------------------- |
| `src/cli/`      | 参数解析、交互式问答、dry-run                        |
| `src/extract/`  | GitHub tarball / 缓存、pnpm workspace 图、包路径解析 |
| `src/generate/` | 扁平化输出、package.json 重写、文件拷贝与 transform  |
| `src/utils/`    | 日志、路径、semver、exec 封装                        |
| `test/`         | 单元测试 + fixture（缩小 upstream 快照）             |
| `docs/`         | dev-guide · decisions · 产品说明                     |

**禁止：** 硬编码 upstream 文件列表而不经 manifest 解析 · 跳过测试的 MR · 在未读 upstream 的情况下编造 `packages/` 结构。

**维护命令：** 见 [`README.md`](README.md) · [`docs/decisions/project-config.md`](docs/decisions/project-config.md)

---

## 3. 与 enjoy-ai-oversea-app 规范的对照（继承项）

以下习惯从 Flutter 项目 **原样继承**，仅技术栈不同：

| 习惯                                          | create-vben-admin 落地                              |
| --------------------------------------------- | --------------------------------------------------- |
| 询问 → 规划 → 分步 → 验证                     | dev-guide CV1-\* 步骤 + 进度表                      |
| 最小 diff、一步一 commit                      | G4 · Agent 不自行 commit                            |
| `main`/`dev` 锚点 + `vX.Y.Z(-*)(_*)` 工作分支 | [`git-workflow.md`](docs/decisions/git-workflow.md) |
| AGENTS.md + Core rule + 里程碑 dev-guide      | 本仓库 `.cursor/rules/` + `docs/versions/`          |
| 文档只写有效事实（D1）                        | decisions 不写「遗留/候选」对照                     |
| 无 Cursor co-author                           | `.githooks/commit-msg` + rule                       |
| 合并前全量门禁                                | `pnpm verify`                                       |
| 不新增平行计划文档                            | 进度只在 dev-guide §4                               |

**不继承：** Flutter/GetX/FVM/Figma/Apifox 相关约束。

---

## 4. Git 版本管理

遵循 Cursor 全局规则 **git-version-management**。

| 规则        | 说明                                                                                         |
| ----------- | -------------------------------------------------------------------------------------------- |
| 日常 commit | 在 **版本分支**（当前：**`v1.0.1`** 或下级 `v1.0.1_*`）；**禁止**在 `dev`/`main` 直接 commit |
| 触发 CI     | merge 版本分支 → **`dev`** 后 **`git push origin dev`**                                      |
| 禁止        | 向 **`main`** / **`dev`** 直接提交                                                           |
| 合并        | 版本开发分支 → **`dev`** → Tag → squash → **`main`**                                         |
| Commit 格式 | [Conventional Commits](https://www.conventionalcommits.org/)                                 |

---

## 5. Agent Skills（推荐）

任务开始时 **读取对应 SKILL.md 全文** 再动手。

| Skill                    | 路径                                             | 何时调用                       |
| ------------------------ | ------------------------------------------------ | ------------------------------ |
| **Systematic debugging** | `~/.cursor/skills/systematic-debugging/SKILL.md` | 测试失败、提取逻辑 bug         |
| **context7**             | Cursor 插件                                      | commander、vitest、tsup 等 API |
| **Sonatype**             | Cursor 插件                                      | 新增 npm 依赖安全审计          |
| **Skill creator**        | `~/.cursor/skills/skill-creator/SKILL.md`        | 为本项目新建专用 skill（可选） |

---

## 6. 依赖管理

- 新增 runtime 依赖前：是否必要、是否有更轻替代、是否与 ESM-only 冲突。
- 优先 Node 内置模块（`node:fs`、`node:path`）。
- 网络拉取 upstream 需可测试（fixture + mock）。

---

## 7. 当前里程碑

**→ v1.0.0 首个可用 CLI** — [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md)（CV1-01 … CV1-12 · **下一步 §7**）。

产品说明：[`docs/versions/v1.0.0/product/PRD_create-vben-admin.md`](docs/versions/v1.0.0/product/PRD_create-vben-admin.md)

---

## 8. 会话提示（可复制）

```
项目：create-vben-admin（Node CLI · 从 vue-vben-admin 提取单模板脚手架）。
GitHub：379949990/create-vben-admin · npm：create-vben-admin
分支：v1.0.1（仅在此开发）→ merge dev → push dev（CI）→ tag Version_1.0.1（Release）。
当前：CV1-01 … CV1-12 已完成；下一步发版（见 dev-guide §7）。
上游：https://github.com/vbenjs/vue-vben-admin
```

---

_文档随里程碑更新；行为变更时同步 README 与 docs/decisions。_
