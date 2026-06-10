# ADR — CLI 提取管线架构

> **状态：** 已采纳（2026-06-09 · Q1 确认）  
> **关联：** [`vben-source-sync.md`](vben-source-sync.md) · dev-guide CV1-05/06

---

## 1. 问题

如何从 pnpm Monorepo 中，以单个 `apps/web-*` 为入口，得到用户可独立运行的项目？

核心子问题：

1. **依赖闭包：** 哪些 `packages/*`、`internal/*` 须包含？
2. **输出形态：** 扁平单 app 还是保留 `packages/` 目录？
3. **workspace 协议：** 如何把 `workspace:*` / `catalog:` 改为可安装引用？

---

## 2. 管线（v1.0.0）

```text
1. fetchUpstream(ref) → cacheDir
2. parseWorkspace(cacheDir) → package index + catalog
3. resolveDependencyClosure(templateApp) → Set<packageName>
   - 递归 workspace 包
   - 附加 @vben/vite-config / @vben/tsconfig / @vben/tailwind-config
   - 排除 backend-mock
4. planFlatOutput(closure) → FilePlan[]
5. transformPackageJson(each) → catalog: → semver；保留 workspace:*
6. writeFiles(targetDir, plan) → pnpm install
```

---

## 3. 输出形态（Q1 — 已确认：单 package 扁平）

应用文件 **提升到仓库根目录**；闭包内 workspace 包保留在 `packages/`、`internal/`：

```text
my-app/
├── package.json          # 来自 apps/web-*，name 改为项目名
├── index.html
├── src/
├── vite.config.ts
├── packages/...          # 闭包 workspace 包（用户通常无需改动）
├── internal/...          # vite-config / tsconfig / tailwind-config 等
├── pnpm-workspace.yaml   # 自 upstream 复制（含 catalog）
├── .npmrc                # 若 upstream 存在则复制
└── README.md             # create-vben 生成说明
```

**说明：**

- 用户感知为 **单应用仓库**（根目录即 app）
- `packages/` / `internal/` 为构建所需 vendor，非第二套业务 app
- 不复制其他 `apps/web-*`、不复制 `backend-mock`

---

## 4. 依赖解析规则

1. 起点：`apps/{template}/package.json`（`@vben/web-*`）
2. 遍历 `dependencies` / `devDependencies` / `peerDependencies` / `optionalDependencies` 中 `workspace:*`
3. 始终并入：`@vben/vite-config`、`@vben/tsconfig`、`@vben/tailwind-config`
4. 跳过：`@vben/backend-mock` 及未选中的其他 app
5. `catalog:` → 从 `pnpm-workspace.yaml` 的 `catalog` 段解析为具体 semver

---

## 5. 生成后行为（Q5）

- 写出文件后 **自动执行** `pnpm install`（含 upstream `postinstall` stub）
- 失败时保留已生成目录并提示用户手动安装

---

## 6. 模块边界

| 模块         | 职责        | 禁止              |
| ------------ | ----------- | ----------------- |
| `extract/*`  | IO + 解析   | 写用户目录        |
| `generate/*` | 编排 + 写入 | 直接 fetch GitHub |
| `cli/*`      | UX          | 依赖图算法        |

---

## 7. 测试策略

- **单元：** parse-workspace、resolve-deps、transform-package-json（`test/fixtures/upstream-mini`）
- **集成：** 从真实 ref 生成 temp dir（本地/CI 可选，需网络）
- **不默认：** 每 CI 拉完整 upstream

---

_输出形态或解析规则变更时同步 dev-guide 与测试 fixture。_
