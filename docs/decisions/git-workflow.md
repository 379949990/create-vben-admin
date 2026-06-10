# Git 与版本分支 — create-vben

> 遵循全局 Cursor 规则 **git-version-management**（`~/.cursor/rules/git-version-management.mdc`）  
> 应用版本：`1.0.0`（`package.json`）

## 版本开发分支命名

**格式：** `vX.Y.Z(-*)(_*)`

| 段       | 必填 | 说明                               |
| -------- | ---- | ---------------------------------- |
| `vX.Y.Z` | ✅   | 语义化版本，与 npm 发版 / Tag 对齐 |
| `(-*)`   | 可选 | 连字符 + **自定义**描述            |
| `(_*)`   | 可选 | 下划线 + **专题** id               |

**合法示例：** `v1.0.0` · `v1.0.0-extract` · `v1.0.1-rc_publish`

**禁止：** `dev/` 前缀（与 ref `dev` 冲突）。

## 本仓库分支角色

| 分支 / Tag           | 用途                             |
| -------------------- | -------------------------------- |
| `main`               | 对外发布基线；仅 **squash** 增长 |
| `dev`                | 版本开发分支切出锚点；集成目标   |
| **`v1.0.0`**         | 当前工作分支：首个可用 CLI       |
| **`vX.Y.Z(-*)(_*)`** | 自 **`dev`** 切出的日常开发分支  |
| Tag `v1.0.0`         | 首个正式 CLI 发版锚点            |

**合并流向：** `vX.Y.Z(-*)(_*)` → **`dev`** → Tag → squash → **`main`**

## 硬约束（Agent / 协作者）

- **禁止** 在 `main` / `dev` 上直接 commit
- 日常开发在自 **`dev` 切出的版本开发分支** 上进行（当前：**`v1.0.0`**）
- Conventional Commits · **一步一 commit**（对应 dev-guide 单步）
- Agent **禁止** 未经确认 `git commit` / `push`

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
git checkout dev
git tag -a v1.0.0 -m "Release v1.0.0"
# npm publish 流程见 CV1-12
```

---

_分支角色变更时同步 `project-config.md` · `AGENTS.md` · `README.md`。_
