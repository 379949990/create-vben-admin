# Git 与版本分支 — create-vben-admin

> 遵循全局 Cursor 规则 **git-version-management**（`~/.cursor/rules/git-version-management.mdc`）  
> 应用版本：`1.0.1`（`package.json`）

## 版本开发分支命名

**格式：** `vX.Y.Z(-*)(_*)`

| 段       | 必填 | 说明                              |
| -------- | ---- | --------------------------------- |
| `vX.Y.Z` | ✅   | 语义化版本，与 npm 发版版本号对齐 |
| `(-*)`   | 可选 | 连字符 + **自定义**描述           |
| `(_*)`   | 可选 | 下划线 + **专题** id              |

**合法示例：** `v1.0.0` · `v1.0.0-extract` · `v1.0.1-rc_publish`

**禁止：** `dev/` 前缀（与 ref `dev` 冲突）。

## 发版 Tag 命名

**格式：** `Version_X.Y.Z`（如 `Version_1.0.0`）

- 与分支 `vX.Y.Z` 区分，避免 ref 同名冲突
- `X.Y.Z` 须与 `package.json` 的 `version` 一致
- Release workflow 监听 `Version_*` tag push

## 本仓库分支角色

| 分支 / Tag              | 用途                                               |
| ----------------------- | -------------------------------------------------- |
| `main`                  | 对外发布基线；仅 **squash** 增长                   |
| `dev`                   | 集成目标；**仅 merge 后 push**（触发 CI）          |
| **`v1.0.1`**            | 当前版本开发分支                                   |
| **`vX.Y.Z(-*)(_*)`**    | 自版本分支切出的下级 / 个人专题分支                |
| Tag **`Version_1.0.1`** | 当前发版锚点（触发 npm + GitHub Release + squash） |

**合并流向：** `vX.Y.Z(-*)(_*)`（或下级专题分支）→ merge **`dev`** → **`git push origin dev`**（CI）→ Tag `Version_X.Y.Z` on **`dev`** → Release workflow（npm + squash **`main`**）

## 硬约束（Agent / 协作者）

- **禁止** 在 `main` / `dev` 上直接 commit（`dev` 仅 fast-forward / merge 版本分支后的集成 push）
- **日常开发** 仅在 **版本分支**（当前 **`v1.0.1`**）或自其切出的 **下级专题分支**（如 `v1.0.1_extract`）上进行
- 集成：`git checkout dev && git merge v1.0.1 --no-edit && git push origin dev` → 触发 [CI](../../.github/workflows/ci.yml)
- Conventional Commits · **一步一 commit**（对应 dev-guide 单步）
- Agent **禁止** 未经确认 `git commit` / `push`；动手前须确认当前分支为 **版本分支**，非 `dev` / `main`
- **`main` squash 由 Release workflow 自动完成**，发版前勿手工 merge dev → main

## 标准操作

### 初始化仓库（已完成 CV1-01）

```bash
cd /Users/wb_hc/H-Zone/DEV/create-vben-admin
git init
git checkout -b dev
git checkout -b v1.0.0
git config core.hooksPath .githooks
chmod +x .githooks/commit-msg
```

### 自版本分支切出下级专题分支

```bash
git checkout v1.0.1
git checkout -b v1.0.1_extract
# … 在专题分支开发 …
git checkout v1.0.1 && git merge v1.0.1_extract --no-edit
# 再按「集成到 dev」push dev 触发 CI
```

### 集成到 dev（触发 CI）

```bash
git checkout dev && git pull origin dev
git merge v1.0.1 --no-edit   # 仅 merge，不在 dev 上改代码
git push origin dev          # 触发 CI（verify）
```

### 发版（就绪后）

```bash
git checkout dev && git pull origin dev
git tag -a Version_1.0.1 -m "Release 1.0.1"
git push origin refs/tags/Version_1.0.1
# Release workflow：npm publish → 自动 squash dev → main
```

详见 [`npm-publish.md`](npm-publish.md)。

---

_分支角色变更时同步 `project-config.md` · `AGENTS.md` · `README.md`。_
