# create-vben-admin

> **create-vben-admin** is an npm CLI that extracts a **single UI template** from the [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) monorepo and scaffolds a standalone Vue 3 + Vite admin project you can install and maintain locally.

**中文：** [README.md](./README.md)

| Field       | Value                                                                  |
| ----------- | ---------------------------------------------------------------------- |
| npm package | [`create-vben-admin`](https://www.npmjs.com/package/create-vben-admin) |
| Upstream    | [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)      |
| Stack       | Vue 3 · Vite · TypeScript · pnpm workspace                             |
| Node        | >= 20.11                                                               |

---

## Table of contents

- [Overview](#overview)
- [When to use](#when-to-use)
- [Quick start](#quick-start)
- [UI templates](#ui-templates)
- [CLI flags](#cli-flags)
- [Defaults](#defaults)
- [FAQ](#faq)
- [Develop this repo](#develop-this-repo)
- [Links](#links)

---

## Overview

[vben-admin](https://www.vben.pro) ships as a monorepo with multiple `apps/web-*` templates and shared `packages/` / `internal/` workspaces. If you only need **one UI stack**, you do not have to clone the entire upstream tree.

**create-vben-admin** is a **vben admin scaffold generator**:

1. Fetch upstream at a git ref (default: latest GitHub release tag)
2. Resolve the pnpm workspace dependency closure
3. Keep only the chosen `apps/web-*` app and its transitive deps
4. Emit a **flat single-app repo** (app code at repository root)
5. Run `pnpm install` and vendor stub automatically

## When to use

| Good fit                                                         | Not a fit                                                  |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| One vben UI template (Ant Design Vue, Element Plus, Naive UI, …) | All upstream `apps/web-*` in one repo                      |
| Smaller standalone repo, less monorepo overhead                  | 1:1 official monorepo workflow                             |
| Reproducible output pinned to an upstream ref                    | Replacing official vben docs or long-term fork maintenance |

## Quick start

### Install and run

```bash
# Zero install (Node >= 20.11)
pnpm dlx create-vben-admin

# Non-interactive (name → ~/Downloads/<name>)
pnpm dlx create-vben-admin my-vben-admin --template web-naive --no-mock

# Full path + upstream ref
pnpm dlx create-vben-admin ~/Downloads/my-vben-admin --template web-antd --ref v5.7.0 --force

# Global install
pnpm add -g create-vben-admin
create-vben-admin --help
```

Interactive **project path** defaults to `~/Downloads/my-vben-admin`.

### After generation

```bash
cd ~/Downloads/my-vben-admin
pnpm dev
```

Dev port comes from `.env.development` → `VITE_PORT` (upstream default **5888**, not 5173).

## UI templates

| ID `--template`  | UI library          | upstream path         |
| ---------------- | ------------------- | --------------------- |
| `web-antd`       | Ant Design Vue      | `apps/web-antd`       |
| `web-ele`        | Element Plus        | `apps/web-ele`        |
| `web-naive`      | Naive UI            | `apps/web-naive`      |
| `web-tdesign`    | TDesign             | `apps/web-tdesign`    |
| `web-antdv-next` | Ant Design Vue Next | `apps/web-antdv-next` |

## CLI flags

| Flag             | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `[project-path]` | Absolute path, relative path, or name → `~/Downloads/<name>` |
| `-t, --template` | Template ID (see table above)                                |
| `-r, --ref`      | upstream git ref; default **latest GitHub release tag**      |
| `--mock`         | Include `apps/backend-mock` (Nitro Mock)                     |
| `--no-mock`      | Exclude mock (default; skips prompt in non-interactive mode) |
| `--offline`      | Use cached upstream snapshot only                            |
| `--force`        | Overwrite non-empty target directory                         |
| `--dry-run`      | Plan only, no file writes                                    |

## Defaults

| Topic          | Behavior                                                               |
| -------------- | ---------------------------------------------------------------------- |
| Layout         | Flat app at repo root; `packages/` / `internal/` kept for build        |
| upstream ref   | Latest release tag (`--ref` to override)                               |
| backend-mock   | **Excluded by default**; opt in with `--mock` or interactive prompt    |
| OpenAPI        | **Always** generates `docs/mock-api.openapi.json` from upstream routes |
| After generate | Auto `pnpm install` + workspace stub (generation fails if stub fails)  |
| Cache          | `~/.create-vben-admin-cache/` (`CREATE_VBEN_ADMIN_CACHE` to override)  |

## FAQ

### How is this different from cloning vue-vben-admin?

Cloning gives you the **full monorepo**. create-vben-admin extracts **one** `apps/web-*` template plus required workspace packages into a smaller standalone project.

### Which package managers can install the CLI?

Published on npm: `pnpm dlx`, `pnpm add -g`, or `npm i -g create-vben-admin`. Generated projects default to **pnpm**.

### What is the default dev server port?

See `VITE_PORT` in the generated `.env.development`. Upstream currently defaults to **5888** — follow the URL printed in your terminal.

### Is a mock backend included?

**Not by default.** Use `--mock` or confirm in prompts to include `apps/backend-mock`. OpenAPI reference is always generated for local mock tools.

### How do I pin the vben version?

Use `--ref`, e.g. `--ref v5.7.0` or a commit SHA. Default is the latest GitHub **release tag**.

### Is this an official vben npm package?

**No.** Generated README states the upstream ref and create-vben-admin version. This is a community extraction tool, not published by vbenjs.

## Develop this repo

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm install` | Install dependencies                     |
| `pnpm dev`     | Run CLI locally (tsx)                    |
| `pnpm verify`  | format · typecheck · lint · test · build |
| `pnpm build`   | Build `dist/` for npm                    |

Manual test output: **`.temp/generated/`** (gitignored).

## Links

- Repo: [github.com/379949990/create-vben-admin](https://github.com/379949990/create-vben-admin)
- Upstream: [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- Vben docs: [doc.vben.pro](https://doc.vben.pro/)
- Publish guide: [`docs/decisions/npm-publish.md`](docs/decisions/npm-publish.md)

## License

MIT
