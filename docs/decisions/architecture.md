# ADR — CLI 提取管线架构

> **状态：** 草案（CV1-05 定稿输出形态）  
> **关联：** [`vben-source-sync.md`](vben-source-sync.md) · dev-guide CV1-05/06

---

## 1. 问题

如何从 pnpm Monorepo 中，以单个 `apps/web-*` 为入口，得到用户可独立运行的项目？

核心子问题：

1. **依赖闭包：** 哪些 `packages/*`、`internal/*` 须包含？
2. **输出形态：** 扁平单 app 还是保留 `packages/` 目录？
3. **workspace 协议：** 如何把 `workspace:*` 改为可安装引用？

---

## 2. 推荐管线（v1.0.0 实现方向）

```text
1. fetchUpstream(ref) → cacheDir
2. parseWorkspace(cacheDir) → { apps, packages, internal }
3. resolveDependencyClosure(templateApp) → Set<packagePath>
   - 读 package.json dependencies / devDependencies
   - 递归 workspace 包，直到外部 npm 包
4. planOutput(closure, strategy) → FilePlan[]
   - strategy 由 Q1 决定
5. transformPackageJson(each) → 相对 file: 或 paths
6. writeFiles(targetDir, plan)
```

---

## 3. 输出形态（Q1 待选）

### 方案 A — mini-monorepo（推荐倾向）

保留 upstream 相对结构：

```text
my-app/
├── apps/web-antd/      # 主应用
├── packages/...        # 闭包内 packages
├── internal/...        # 若被依赖
├── pnpm-workspace.yaml # 精简版
├── package.json        # root scripts 指向单 app
└── pnpm-lock.yaml      # 可选：后续生成
```

**优点：** transform 少、与 upstream 脚本兼容度高  
**缺点：** 对用户仍有一点 monorepo 认知

### 方案 B — 单 package 扁平

将所有源码合并到根目录，`packages` 变为 `src/vendor/*` 或通过 bundler alias。

**优点：** 用户感知简单  
**缺点：** transform 复杂、易与 upstream 升级脱节

**v1.0.0 建议：** 先 **方案 A**，待 US 反馈再评估 B。

---

## 4. 依赖解析规则

1. 起点：`apps/{template}/package.json`
2. 遍历 `dependencies` / `devDependencies` / `peerDependencies`（workspace 名）
3. 匹配 `pnpm-workspace.yaml` glob 解析物理路径
4. 跳过：`backend-mock` 除非 `--with-mock`（Q3）
5. 记录闭包用于 `--dry-run` 输出

---

## 5. 模块边界（代码）

| 模块         | 职责        | 禁止              |
| ------------ | ----------- | ----------------- |
| `extract/*`  | IO + 解析   | 写用户目录        |
| `generate/*` | 编排 + 写入 | 直接 fetch GitHub |
| `cli/*`      | UX          | 依赖图算法        |

---

## 6. 测试策略

- **单元：** parse-workspace、resolve-deps（小 fixture）
- **快照：** transform 后的 package.json
- **集成：** 从 tarball fixture 生成 temp dir → 断言关键文件存在
- **不默认：** 每 CI 拉完整 upstream（太慢）；用 pinned fixture

---

## 7. 开放项

- [ ] Q1：A vs B 最终确认
- [ ] root `package.json` scripts 如何映射单 app
- [ ] 是否复制 `turbo.json` / 仅保留 vite 脚本

---

_CV1-05 完成后更新状态与 §3 最终方案。_
