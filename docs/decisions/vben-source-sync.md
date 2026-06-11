# ADR — upstream 源码同步策略

> **状态：** 已采纳（2026-06-09 · Q2/Q6 确认）  
> **上游：** [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)

---

## 1. 背景

create-vben-admin 的价值在于与 **upstream 指定结构** 同步，而非维护静态模板副本。须明确：如何拉取、缓存、pin 版本、离线复用。

---

## 2. 决策

### 2.1 拉取方式

**GitHub tarball**（默认）：

```text
https://codeload.github.com/vbenjs/vue-vben-admin/tar.gz/{ref}
```

- 无 git 依赖
- `--ref` 支持 tag / branch / commit SHA

### 2.2 缓存

| 项          | 值                                   |
| ----------- | ------------------------------------ |
| 默认目录    | `~/.create-vben-admin-cache/`        |
| 环境变量    | `CREATE_VBEN_ADMIN_CACHE` 覆盖根目录 |
| 键          | `{owner}/{repo}/{sanitizedRef}/`     |
| 命中        | 目录内存在 `pnpm-workspace.yaml`     |
| `--offline` | 仅读缓存；缺失则失败并提示先在线拉取 |

### 2.3 默认 ref（Q2 — 已确认）

**最新 GitHub release tag**（`GET /repos/vbenjs/vue-vben-admin/releases/latest` → `tag_name`）。

- CLI 未传 `--ref` 时使用
- 可显式 `--ref main` 或 `--ref v5.7.0` 覆盖

### 2.4 网络与鉴权（Q6 — 已确认）

| 项           | 决策                                                            |
| ------------ | --------------------------------------------------------------- |
| v1.0.0 默认  | **不使用** `GITHUB_TOKEN`                                       |
| 匿名 tarball | 足够日常使用                                                    |
| 后续计划     | 支持用户配置 token 以提高 rate limit（长期项，见 dev-guide §5） |

### 2.5 完整性

- v1.0.0：解压后即用，**不** 强制 commit SHA 校验
- 后续可考虑 release tarball checksum

### 2.6 默认排除（Q3）

- **不包含** `backend-mock`
- 不复制未选中的其他 `apps/web-*`

---

## 3. upstream 结构速查

```
vue-vben-admin/
├── apps/
│   ├── web-antd
│   ├── web-ele
│   ├── web-naive
│   ├── web-tdesign
│   ├── web-antdv-next
│   └── backend-mock          # 不纳入生成物
├── packages/
├── internal/
├── pnpm-workspace.yaml
└── package.json
```

模板 ID 与 `apps/` 子目录 **1:1**；见 `src/core/constants.ts`。

**官方文档：** [目录说明](https://doc.vben.pro/guide/project/dir.html)

---

## 4. 变更流程

upstream 新增/移除 `apps/web-*` 时：

1. 核对官方 repo
2. 更新 `VBEN_TEMPLATE_IDS`
3. 更新本 ADR + dev-guide + 测试 fixture
4. 同 MR 完成

---

_默认 ref 或缓存策略变更时同步 `architecture.md` 与 CLI 常量。_
