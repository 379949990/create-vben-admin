# npm 发布与 GitHub Release

> **状态：** v1.0.0 · 包名 `create-vben-admin` · CI 自动发版 + 自动 squash `main`

---

## 1. 触发方式

| 事件                                       | Workflow                                                               | 行为                                                                 |
| ------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------- |
| PR → `dev`、push `v*` 分支                 | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)           | `pnpm verify`                                                        |
| push tag `Version_*`（如 `Version_1.0.0`） | [`.github/workflows/release.yml`](../../.github/workflows/release.yml) | 校验 tag → verify → npm publish → GitHub Release → **squash `main`** |

**新 tag 判定：** 以 tag 指向的 commit SHA（`tag^{commit}`）为标识。同名 tag 删除后重打、或 `--force` 推送 tag，只要 commit 变就会重新触发；workflow 要求 tag **必须指向当前 `origin/dev` HEAD**。

Tag 推送后 Release workflow 会：

1. 校验 tag 格式 `Version_X.Y.Z`、在 `dev` 上且与 `package.json` 版本一致
2. 跑 `pnpm verify`
3. `pnpm pack` 生成 `create-vben-admin-<version>.tgz`（附到 Release 资产）
4. `pnpm publish` 到 [npmjs.com/package/create-vben-admin](https://www.npmjs.com/package/create-vben-admin)（若该版本已在 npm 则跳过，便于重跑 workflow）
5. 创建/更新 GitHub Release
6. **`git merge --squash origin/dev` → `main` 并 push**（预设 squash 提交信息模板）

> **说明：** 裸名 `create-vben` 在 npm 上已被他人占用且 unpublish，本仓库发布 **`create-vben-admin`**（账号 `fluoxetine_`）。

**`main` 不再手工 squash。** 发版前 `main` 可保持在上一发版基线；npm 发布成功后由 workflow 自动 squash。

---

## 2. 仓库 Secrets（负责人配置一次）

在 GitHub → **Settings → Secrets and variables → Actions** 新增：

| Secret      | 说明                                                                                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` | [npm Access Token](https://www.npmjs.com/settings/fluoxetine_/tokens)（**Automation** 或 Granular **Read and write**；开启 2FA 时勿用 Classic Publish） |

`NODE_AUTH_TOKEN` 须在 **`actions/setup-node` 执行前** 可用（workflow 已设为 job 级 env），否则 `.npmrc` 无 token 会导致 publish **403**。

`GITHUB_TOKEN` 用于 GitHub Release 与 push `main`；若 `main` 有分支保护，须允许 **GitHub Actions** 绕过或写入。

---

## 3. 发版流程（负责人手动部分）

```bash
# 1. 版本分支合并到 dev（PR + CI 通过）
git checkout dev && git pull origin dev
git merge v1.0.0 --no-edit   # 示例
git push origin dev

# 2. 在 dev HEAD 打 tag（Version_ 前缀 + package.json 版本）
git tag -a Version_1.0.0 -m "Release 1.0.0"

# 3. 只 push tag（不要手工 squash main）
git push origin refs/tags/Version_1.0.0
```

**同名 tag 重发（如修正包名后重试）：**

```bash
git checkout dev && git pull origin dev
git tag -d Version_1.0.0
git tag -a Version_1.0.0 -m "Release 1.0.0 (retry)"
git push origin :refs/tags/Version_1.0.0
git push origin refs/tags/Version_1.0.0
```

**注意：** 开发分支 `v1.0.0` 与发版 tag `Version_1.0.0` 不同名，避免 ref 冲突。push 分支用 `git push origin refs/heads/v1.0.0`，push tag 用 `git push origin refs/tags/Version_1.0.0`。

---

## 4. squash 提交信息模板（workflow 自动生成）

```
release(<version>): publish <package> CLI

Tag: Version_<version> @ <commit-sha>
npm: https://www.npmjs.com/package/<package>
dev: squash merged after successful Release workflow
```

---

## 5. 本地 npm 登录（仅用 pnpm 时）

```bash
pnpm login
# 或
pnpm config set //registry.npmjs.org/:_authToken=npm_xxxxxxxx
```

本地试发布：

```bash
pnpm verify
pnpm pack
pnpm publish --dry-run --access public
```

全局安装自测：

```bash
pnpm build
pnpm pack
pnpm add -g ./create-vben-admin-1.0.0.tgz
create-vben-admin --help
```

---

## 6. 用户安装方式

```bash
pnpm dlx create-vben-admin
pnpm add -g create-vben-admin
```

---

_发版策略变更时同步 dev-guide §4 与 README。_
