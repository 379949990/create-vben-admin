# npm 发布与 GitHub Release

> **状态：** v1.0.0 · 包名 `create-vben` · CI 自动发版

---

## 1. 触发方式

| 事件                         | Workflow                                                               | 行为                                                 |
| ---------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------- |
| PR → `dev`、push `v*` 分支   | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)           | `pnpm verify`                                        |
| push tag `v*`（如 `v1.0.0`） | [`.github/workflows/release.yml`](../../.github/workflows/release.yml) | verify → pack → **npm publish** → **GitHub Release** |

Tag 推送后 Release workflow 会：

1. 跑 `pnpm verify`
2. `pnpm pack` 生成 `create-vben-<version>.tgz`（附到 Release 资产）
3. `pnpm publish --access public` 发布到 [npmjs.com/package/create-vben](https://www.npmjs.com/package/create-vben)
4. 用 [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release) 创建 **GitHub Releases** 页面（`generate_release_notes: true` 自动生成变更摘要）

---

## 2. 仓库 Secrets（负责人配置一次）

在 GitHub → **Settings → Secrets and variables → Actions** 新增：

| Secret      | 说明                                                                                              |
| ----------- | ------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | [npm Access Token](https://www.npmjs.com/settings/~youruser/tokens)（Automation 或 Publish 类型） |

无需在 workflow 里单独配置 `GITHUB_TOKEN`；`action-gh-release` 使用默认 `GITHUB_TOKEN`（workflow 已声明 `contents: write`）。

---

## 3. 发版流程（与 git-workflow 对齐）

```bash
# 1. 版本分支合并到 dev（PR + CI 通过）
git checkout dev && git pull

# 2. 在 dev 上打 tag（版本号与 package.json 一致，tag 带 v 前缀）
git tag -a v1.0.0 -m "Release v1.0.0"

# 3. squash 合并 dev → main（发版提交）
git checkout main && git pull
git merge --squash dev
git commit -m "release(v1.0.0): first public CLI"

# 4. 推送 main 与 tag（tag push 触发 Release workflow）
git push origin main
git push origin v1.0.0
```

**注意：** Release workflow 监听 **tag push**，不是 main 上的普通 commit。必须先打 tag 并 `git push origin v1.0.0`。

发版后可在 GitHub 仓库 **Releases** 页看到自动生成的 Release；npm 上可 `pnpm dlx create-vben` / `pnpm add -g create-vben`。

---

## 4. 本地 npm 登录（仅用 pnpm 时）

无法使用 `npm login` / `npx` 时，可用 **pnpm** 对接同一 registry：

```bash
# 交互登录（写入 ~/.npmrc）
pnpm login

# 或手动 token（npmjs.com → Access Tokens → Generate）
pnpm config set //registry.npmjs.org/:_authToken=npm_xxxxxxxx
```

本地试发布（勿在 CI 前误发正式版，可用 dry-run）：

```bash
pnpm verify
pnpm pack
pnpm publish --dry-run --access public
```

全局安装自测（你当前方式）：

```bash
pnpm build
pnpm pack
pnpm add ./create-vben-1.0.0.tgz -g
create-vben --help
```

---

## 5. 用户安装方式

```bash
pnpm dlx create-vben
pnpm add -g create-vben
# 或（有 npm 时）npx create-vben
```

---

_发版策略变更时同步 dev-guide §4 与 README。_
