# {{packageName}}

> Standalone frontend scaffold extracted from [vue-vben-admin]({{upstreamRepo}}) via [create-vben]({{createVbenRepo}}).

[中文 README](./README.md)

## Overview

| Field        | Value                                  |
| ------------ | -------------------------------------- |
| UI template  | `{{templateId}}` ({{templateLabelEn}}) |
| upstream ref | `{{ref}}`                              |
| create-vben  | `{{createVbenVersion}}`                |

This repo uses a **flat layout**: application code lives at the repository root; required upstream workspace packages are kept under `packages/` and `internal/` and usually do not need edits.

## Quick start

```bash
pnpm dev
```

Open the local URL printed in the terminal (typically `http://localhost:5173`).

## Scripts

| Command          | Description              |
| ---------------- | ------------------------ |
| `pnpm dev`       | Development server       |
| `pnpm build`     | Production build         |
| `pnpm preview`   | Preview production build |
| `pnpm typecheck` | TypeScript check         |

## Notes

- **`backend-mock` is not included** by default; wire your own API in Vite config / env when needed.
- Other `apps/web-*` templates from upstream are not copied.
- To refresh the vben baseline, re-run create-vben with a newer upstream ref or merge upstream changes manually.

## Links

- [Vben Admin docs](https://doc.vben.pro/)
- [vue-vben-admin]({{upstreamRepo}})
- [create-vben]({{createVbenRepo}})

## License

MIT (application code follows upstream and create-vben generation notes; see file headers where applicable.)
