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
   - `@vben/backend-mock`：默认排除；`--mock` 或交互确认时纳入
4. planFlatOutput(closure) → FilePlan[]
5. transformPackageJson(each) → catalog: → semver；保留 workspace:*
   - 根 devDependencies：从闭包 scripts + upstream 根 devDeps **推导 hoist**（`derive-root-dev-deps.ts`）
6. writeFiles(targetDir, plan) → patch `.env.development` · OpenAPI · remove-mock 脚本 · README
7. pnpm install → runWorkspaceStub → assertVendorBuildArtifacts（失败则生成失败）
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
└── README.md             # create-vben-admin 生成说明
```

**说明：**

- 用户感知为 **单应用仓库**（根目录即 app）
- `packages/` / `internal/` 为构建所需 vendor，非第二套业务 app
- 不复制其他 `apps/web-*`
- `backend-mock` 默认不复制；用户选择 `--mock` 时复制至 `apps/backend-mock/`
- 生成物附带 `scripts/remove-mock.mjs`（`pnpm run remove-mock`）及 README 说明
- 官方 Monorepo 项目精简见 [Vben 精简指南](https://doc.vben.pro/guide/introduction/thin.html)（与 Mock 移除无关）

---

## 4. 依赖解析规则

1. 起点：`apps/{template}/package.json`（`@vben/web-*`）
2. 遍历 `dependencies` / `devDependencies` / `peerDependencies` / `optionalDependencies` 中 `workspace:*`
3. 始终并入：`@vben/vite-config`、`@vben/tsconfig`、`@vben/tailwind-config`
4. `@vben/backend-mock`：默认跳过；`includeMock: true` 时作为 seed 纳入闭包
5. 跳过未选中的其他 app
6. `catalog:` → 从 `pnpm-workspace.yaml` 的 `catalog` 段解析为具体 semver
7. **根 devDependencies hoist：** 扫描闭包内 `stub` / `build` / app scripts 与 workspace 包 devDeps 中的外部工具名，与 upstream 根 `devDependencies` 取交集后写入生成物根 `package.json`（见 `derive-root-dev-deps.ts`）

---

## 5. 生成后行为（Q5 · P0）

1. 写出文件后 **自动执行** `pnpm install`
2. **强制** `pnpm -r run stub --if-present` 构建 workspace vendor（`@vben/vite-config` 等）
3. 校验关键产物存在（如 `internal/vite-config/dist/index.mjs`）；**任一失败则整次生成失败**（exit ≠ 0）
4. 不再在 install/stub 失败后静默交付「不能 dev」的半成品项目

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
