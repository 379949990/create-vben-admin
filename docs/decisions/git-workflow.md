# Git 与版本分支 — create-vben

> 遵循全局 Cursor 规则 **git-version-management**（`~/.cursor/rules/git-version-management.mdc`）  
> 应用版本：`1.0.0`（`package.json`）

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

| 分支 / Tag              | 用途                                           |
| ----------------------- | ---------------------------------------------- |
| `main`                  | 对外发布基线；仅 **squash** 增长               |
| `dev`                   | 版本开发分支切出锚点；集成目标                 |
| **`v1.0.0`**            | 当前工作分支                                   |
| **`vX.Y.Z(-*)(_*)`**    | 自 **`dev`** 切出的日常开发分支                |
| Tag **`Version_1.0.0`** | 发版锚点（触发 npm + GitHub Release + squash） |

**合并流向：** `vX.Y.Z(-*)(_*)` → **`dev`** → Tag `Version_X.Y.Z` on **`dev`** → Release workflow（npm + squash **`main`**）

## 硬约束（Agent / 协作者）

- **禁止** 在 `main` / `dev` 上直接 commit
- 日常开发在自 **`dev` 切出的版本开发分支** 上进行（当前：**`v1.0.0`**）
- Conventional Commits · **一步一 commit**（对应 dev-guide 单步）
- Agent **禁止** 未经确认 `git commit` / `push`
- **`main` squash 由 Release workflow 自动完成**，发版前勿手工 merge dev → main

## 标准操作

### 初始化仓库（已完成 CV1-01）

```bash
cd /Users/wb_hc/H-Zone/DEV/create-vben
git init
git checkout -b dev
git checkout -b v1.0.0
git config core.hooksPath .githooks
chmod +x .githooks/commit-msg
```

### 自 dev 切出新专题分支

```bash
git checkout dev
git checkout -b v1.0.0_extract
# … 开发 …
# MR 合并回 dev
```

### 发版（就绪后）

```bash
git checkout dev && git pull origin dev
git tag -a Version_1.0.0 -m "Release 1.0.0"
git push origin refs/tags/Version_1.0.0
# Release workflow：npm publish → 自动 squash dev → main
```

详见 [`npm-publish.md`](npm-publish.md)。

---

_分支角色变更时同步 `project-config.md` · `AGENTS.md` · `README.md`。_
