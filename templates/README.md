# templates/

Patches and static fragments copied or rendered into generated projects.

| Path                        | Purpose                    |
| --------------------------- | -------------------------- |
| `generated/README.zh-CN.md` | 生成物默认中文 README 模板 |
| `generated/README.en.md`    | 生成物英文 README 模板     |

Variables use `{{name}}` placeholders; rendered by `src/generate/write-readme.ts`.
