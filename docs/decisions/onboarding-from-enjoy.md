# 开发习惯与规范摘要 — 从 enjoy-ai-oversea-app 到 create-vben

> 本文档供 **负责人** 与 **新 Agent 会话** 快速对齐习惯；权威细则仍以 `AGENTS.md` 与 `.cursor/rules/` 为准。

---

## 1. 你一贯的开发习惯（已映射）

| 习惯                     | 说明                                   | create-vben 落地                          |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| **先问再做**             | PRD/API/未确认行为不臆造               | dev-guide §5 Q1–Q6；upstream 结构先查官方 |
| **五段工作流**           | 询问 → 设计 → 分步 → 验证 → 下一步     | Core rule + dev-guide §0                  |
| **里程碑 dev-guide**     | 唯一进度真源，V1/CV1 步骤 + 进度表     | `docs/versions/v1.0.0/dev-guide.md`       |
| **最小 diff**            | 一步一主题，不做无关重构               | Core rule + G4                            |
| **合并门禁**             | format · analyze/lint · test · build   | `pnpm verify`                             |
| **Agent 不提交**         | 负责人 review 后再 commit              | G5 · AGENTS §0                            |
| **无 Cursor co-author**  | commit-msg hook + rule                 | `.githooks/` + `no-cursor-coauthor.mdc`   |
| **Git 双轨**             | main/dev 锚点 + vX.Y.Z 工作分支        | `git-workflow.md`                         |
| **Conventional Commits** | 一步一 commit                          | 同 enjoy 项目                             |
| **文档克制 D1**          | 不写废弃对照、不写易变指标             | decisions ADR 只写有效决策                |
| **AGENTS.md 入口**       | Agent 60s 启动清单                     | 本仓库 `AGENTS.md`                        |
| **Cursor rules**         | alwaysApply core + 里程碑 architecture | `.cursor/rules/create-vben-*.mdc`         |

---

## 2. 有意不继承的部分

- Flutter / GetX / FVM / Dart analyze
- Figma / design-tokens / AppColors
- Apifox / 移动端 PRD
- `fvm flutter test` 超时规则 → 改为 Vitest + 60s 单测约定（可按需加 rule）

---

## 3. create-vben 特有要求

1. **upstream 是真源** — 提取逻辑跟随 [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin)，不维护平行模板副本。
2. **解析优于硬编码** — 依赖 `pnpm-workspace.yaml` + package.json 图，而非写死文件列表。
3. **可测试** — fetch 可 mock；fixture 用小体积快照。
4. **用户感知** — 生成物 README 必须说明来源与 ref，不冒充官方发行版。

---

## 4. 新 Agent 窗口建议开场

1. 在 Cursor 打开文件夹：`/Users/wb_hc/H-Zone/DEV/create-vben`
2. 粘贴 AGENTS.md §8 会话提示
3. 明确当前步骤（如 CV1-02）与待确认 Q\*
4. 运行 `pnpm install && pnpm verify` 确认基线绿

---

## 5. 后续可选增强

- [ ] 专用 Cursor skill：`~/.cursor/skills/create-vben-extract/SKILL.md`
- [ ] CI：GitHub Actions `verify` on PR
- [ ] changesets 发版
- [ ] 与 vben 官方版本矩阵文档链接

---

_2026-06-09 随 CV1-01 初始化。_
