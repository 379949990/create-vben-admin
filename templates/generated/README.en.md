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
pnpm install   # skip if already done during create-vben
pnpm dev
```

{{devServerNoteEn}}

## Scripts

| Command                     | Description                    |
| --------------------------- | ------------------------------ |
| `pnpm dev`                  | Development server             |
| `pnpm build`                | Production build               |
| `pnpm preview`              | Preview production build       |
| `pnpm typecheck`            | TypeScript check               |
| `pnpm run thin:remove-mock` | Remove mock server (see below) |

{{mockSectionEn}}

{{apiSectionEn}}

{{thinSectionEn}}

## Notes

- Other `apps/web-*` templates from upstream are not copied.
- To refresh the vben baseline, re-run create-vben with a newer upstream ref or merge upstream changes manually.

## Links

- [Vben Admin docs](https://doc.vben.pro/)
- [Vben thin guide](https://doc.vben.pro/guide/introduction/thin.html)
- [vue-vben-admin]({{upstreamRepo}})
- [create-vben]({{createVbenRepo}})

## License

MIT (application code follows upstream and create-vben generation notes; see file headers where applicable.)
