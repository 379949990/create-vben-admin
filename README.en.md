# create-vben

> Extract a **single UI template** from the [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) monorepo into a standalone, maintainable local project.

**中文：** [README.md](./README.md)

---

## Overview

[vben-admin](https://www.vben.pro) ships as a monorepo with multiple `apps/web-*` templates and shared `packages/` / `internal/` workspaces. If you only need **one UI stack**, you do not have to clone the entire upstream tree.

**create-vben** is an npm CLI: fetch upstream at a ref → resolve the pnpm workspace graph → keep the chosen app and its transitive deps → emit a **flat single-app repo** → run `pnpm install` automatically.

## Quick start

```bash
npx create-vben

# Non-interactive (simple name → ~/Downloads/<name>)
npx create-vben my-vben-admin --template web-naive

# Full path
npx create-vben ~/Downloads/my-vben-admin --template web-antd --ref v5.7.0
```

Interactive mode defaults the **project path** to `~/Downloads/my-vben-admin` (editable).

Then:

```bash
cd ~/Downloads/my-vben-admin
pnpm dev
```

## UI templates

| ID               | UI library          | upstream path         |
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
| `-t, --template` | Template ID                                                  |
| `-r, --ref`      | upstream ref; default **latest GitHub release tag**          |
| `--offline`      | Use cache only                                               |
| `--mock`         | Include `apps/backend-mock` (Nitro Mock)                     |
| `--no-mock`      | Exclude mock (default; skips prompt in non-interactive mode) |
| `--force`        | Overwrite non-empty target                                   |
| `--dry-run`      | Plan only, no writes                                         |

## Defaults

| Topic          | Behavior                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------- |
| Layout         | Flat app at repo root; `packages/` / `internal/` kept for build                              |
| upstream ref   | Latest release tag (`--ref` to override)                                                     |
| backend-mock   | **Excluded by default**; use `--mock` or confirm in prompts; OpenAPI reference when excluded |
| After generate | Auto `pnpm install`                                                                          |
| Cache          | `~/.create-vben-cache/` (`CREATE_VBEN_CACHE` to override)                                    |

## Develop this repo

| Command        | Description                              |
| -------------- | ---------------------------------------- |
| `pnpm install` | Install deps                             |
| `pnpm dev`     | Run CLI locally                          |
| `pnpm verify`  | format · typecheck · lint · test · build |
| `pnpm build`   | Build `dist/` for npm                    |

Test/manual output goes under **`.temp/generated/`** (gitignored).

## Docs

- [`AGENTS.md`](AGENTS.md) — agent entry
- [`docs/versions/v1.0.0/dev-guide.md`](docs/versions/v1.0.0/dev-guide.md) — milestone plan
- [`docs/decisions/`](docs/decisions/) — ADRs

## Links

- Repo: [github.com/379949990/create-vben](https://github.com/379949990/create-vben)
- upstream: [vbenjs/vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)
- Vben docs: [doc.vben.pro](https://doc.vben.pro/)

## License

MIT
