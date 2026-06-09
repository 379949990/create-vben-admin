# PRD — create-vben CLI

> **版本：** 0.1（草案）  
> **状态：** 供里程碑 v1.0.0 开发与验收参考；细节可在 dev-guide 步骤中细化。

---

## 1. 背景与目标

### 1.1 背景

- [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) 是成熟的 Vue3 后台模板，采用 **Monorepo**（Turbo + pnpm workspace）。
- `apps/` 含多套 UI 实现：`web-antd`、`web-ele`、`web-naive`、`web-tdesign`、`web-antdv-next` 等。
- 维护者需要 Monorepo；**终端用户**往往只需 **一种 UI 库** 的起始工程。

### 1.2 产品目标

提供 **create-vben** CLI，使用户通过一条命令获得：

- 与 upstream **指定版本** 结构一致的、**仅含所选模板** 的项目骨架
- 可本地 `pnpm install` 并启动开发服务器
- 无需 clone 完整 Monorepo、无需理解全部 `packages/`

### 1.3 非目标

- 替代官方 vben 文档或 Monorepo 开发模式
- 自动跟踪用户项目与 upstream 的后续 merge（可作未来版本）
- 支持 vben 2.x（仅 **5.x** main 线）

---

## 2. 用户故事

| ID    | 作为       | 我想要                                 | 以便                 |
| ----- | ---------- | -------------------------------------- | -------------------- |
| US-01 | 前端开发者 | `npx create-vben my-app`               | 快速创建后台项目     |
| US-02 | 用户       | 选择 UI 库（Ant Design / Element / …） | 只下载相关代码       |
| US-03 | 用户       | 指定 `--ref v5.7.0`                    | 锁定与文档一致的版本 |
| US-04 | 用户       | `--dry-run` 查看将生成的包列表         | 评估体积与结构       |
| US-05 | CI         | 非交互 flags                           | 自动化创建项目       |

---

## 3. 功能需求

### 3.1 安装与入口

- npm 包名：**create-vben**（待 Q4 确认 scope）
- `bin`: `create-vben`
- 支持：`npm i -g create-vben`、`npx create-vben`

### 3.2 交互流程

1. 询问项目名（或 CLI 参数）
2. 选择 UI 模板（5 选 1，与 upstream `apps/` 对齐）
3. （可选）选择 upstream ref，默认见 Q2
4. 拉取 / 读缓存 → 解析 → 写入目标目录
5. 打印下一步命令（`cd` · `pnpm install` · `pnpm dev`）

### 3.3 命令行参数（初版）

| 参数             | 说明         |
| ---------------- | ------------ |
| `[project-name]` | 目标目录     |
| `-t, --template` | 模板 ID      |
| `-r, --ref`      | git ref      |
| `--offline`      | 仅用缓存     |
| `--force`        | 覆盖非空目录 |
| `--dry-run`      | 只输出计划   |

### 3.4 生成物要求

- 包含运行所选 app 所需的 **全部 workspace 依赖包**
- `package.json` 依赖可安装（无 dangling `workspace:*`）
- 保留 upstream 许可证与必要版权声明（MIT）
- 生成 README 注明：**由 create-vben 从 vue-vben-admin @ ref 生成**

---

## 4. 技术约束

- Node >= 20.11
- 与 upstream 一致默认 **pnpm**
- 提取逻辑 **不 fork** 手写模板；以 **实时 upstream** 为准（可缓存）

---

## 5. 成功指标（v1.0.0）

- [ ] 至少 **web-antd** 模板端到端生成成功
- [ ] `pnpm verify` 在本仓库通过
- [ ] 集成测试覆盖 fetch + resolve + write（fixture）
- [ ] 文档齐全：AGENTS · dev-guide · ADR

---

## 6. 开放问题

见 dev-guide §5（Q1–Q6）。

---

_产品变更时同步 dev-guide 与 README。_
