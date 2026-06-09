# ADR — upstream 源码同步策略

> **状态：** 草案（CV1-02 定稿）  
> **上游：** [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)

---

## 1. 背景

create-vben 的价值在于与 **upstream 最新（或指定）结构** 同步，而非维护一份静态模板副本。须明确：如何拉取、缓存、pin 版本、离线复用。

---

## 2. 决策（待负责人确认 Q2）

### 2.1 拉取方式（推荐）

| 方案                                                         | 优点                  | 缺点                  |
| ------------------------------------------------------------ | --------------------- | --------------------- |
| **A. GitHub tarball** `codeload.github.com/.../tar.gz/{ref}` | 无 git 依赖、实现简单 | 大 repo 体积          |
| B. shallow clone                                             | 可增量                | 需 git、复杂          |
| C. GitHub API + sparse                                       | 精细                  | API limit、实现成本高 |

**推荐 A** 作为 v1.0.0 默认；`--ref` 支持 tag / branch / commit SHA。

### 2.2 缓存

- 目录：`~/.create-vben-cache/`（或 `$CREATE_VBEN_CACHE`）
- 键：`{owner}/{repo}/{refHash}/`
- `--offline`：仅读缓存；缺失则失败并提示先在线拉取

### 2.3 默认 ref（Q2 待定）

| 选项                 | 说明                         |
| -------------------- | ---------------------------- | ------ |
| `main`               | 始终最新；可能不稳定         |
| **最新 release tag** | 与官方发版对齐（推荐待确认） |
| 固定 minor           | 如 `v5.7.0`                  | 可预测 |

### 2.4 网络与鉴权（Q6）

- 匿名 tarball 通常足够
- 可选 env：`GITHUB_TOKEN` 提高 rate limit
- 失败时：清晰错误 + 建议 `--offline` 或检查 ref

### 2.5 完整性

- v1.0.0：解压后即用，**不** 强制 commit SHA 校验
- 后续可考虑 release tag 的 tarball checksum

---

## 3. upstream 结构速查（2026-06）

```
vue-vben-admin/
├── apps/
│   ├── web-antd
│   ├── web-ele
│   ├── web-naive
│   ├── web-tdesign
│   ├── web-antdv-next
│   └── backend-mock          # 默认不纳入（Q3）
├── packages/                 # 共享 workspace 包
├── internal/                 # 构建/配置工具链
├── pnpm-workspace.yaml
├── package.json
└── turbo.json
```

模板 ID 与 `apps/` 子目录 **1:1**；见 `src/core/constants.ts`。

**官方文档：** [目录说明](https://doc.vben.pro/guide/project/dir.html)

---

## 4. 变更流程

upstream 新增/移除 `apps/web-*` 时：

1. 核对官方 repo
2. 更新 `VBEN_TEMPLATE_IDS`
3. 更新本 ADR + dev-guide + 测试 fixture
4. 同 MR 完成，**禁止** 只改代码不更新文档

---

## 5. 开放项

- [ ] Q2：默认 ref
- [ ] Q6：`GITHUB_TOKEN` 支持优先级
- [ ] 是否在 cache 中保留多 ref 及 LRU 淘汰

---

_CV1-02 完成后将状态改为「已采纳」并删除已决开放项。_
