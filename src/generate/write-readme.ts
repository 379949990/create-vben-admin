import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CREATE_VBEN_META } from '../core/meta.js';
import { getPackagePath } from '../core/package-root.js';
import { type VbenTemplateId } from '../core/constants.js';

const GENERATED_DIR = getPackagePath('templates/generated');

const TEMPLATE_LABELS: Record<VbenTemplateId, { zh: string; en: string }> = {
  'web-antd': { zh: 'Ant Design Vue', en: 'Ant Design Vue' },
  'web-ele': { zh: 'Element Plus', en: 'Element Plus' },
  'web-naive': { zh: 'Naive UI', en: 'Naive UI' },
  'web-tdesign': { zh: 'TDesign', en: 'TDesign' },
  'web-antdv-next': { zh: 'Ant Design Vue Next', en: 'Ant Design Vue Next' },
};

export async function writeGeneratedReadme(options: {
  targetDir: string;
  packageName: string;
  templateId: VbenTemplateId;
  ref: string;
  createVbenVersion: string;
  includeMock: boolean;
  devPort?: string;
  openApiRelativePath?: string;
}): Promise<void> {
  const labels = TEMPLATE_LABELS[options.templateId];
  const devPort = options.devPort ?? '5888';

  const sections = buildReadmeSections({
    includeMock: options.includeMock,
    devPort,
    openApiRelativePath: options.openApiRelativePath,
  });

  const vars: Record<string, string> = {
    packageName: options.packageName,
    templateId: options.templateId,
    templateLabelZh: labels.zh,
    templateLabelEn: labels.en,
    ref: options.ref,
    createVbenVersion: options.createVbenVersion,
    createVbenRepo: CREATE_VBEN_META.repository,
    upstreamRepo: 'https://github.com/vbenjs/vue-vben-admin',
    devPort,
    devServerNoteZh: sections.devServerNoteZh,
    devServerNoteEn: sections.devServerNoteEn,
    mockCommandRowZh: sections.mockCommandRowZh,
    mockCommandRowEn: sections.mockCommandRowEn,
    mockSectionZh: sections.mockSectionZh,
    mockSectionEn: sections.mockSectionEn,
    apiSectionZh: sections.apiSectionZh,
    apiSectionEn: sections.apiSectionEn,
  };

  const [zh, en] = await Promise.all([
    renderTemplate('README.zh-CN.md', vars),
    renderTemplate('README.en.md', vars),
  ]);

  await Promise.all([
    writeFile(join(options.targetDir, 'README.md'), zh, 'utf8'),
    writeFile(join(options.targetDir, 'README.en.md'), en, 'utf8'),
  ]);
}

function buildReadmeSections(options: {
  includeMock: boolean;
  devPort: string;
  openApiRelativePath?: string;
}) {
  const devServerNoteZh = `开发服务器端口由根目录 \`.env.development\` 中的 \`VITE_PORT\` 控制（当前为 **${options.devPort}**）。请以终端实际输出为准。`;
  const devServerNoteEn = `The dev server port is controlled by \`VITE_PORT\` in \`.env.development\` (currently **${options.devPort}**). Always follow the URL printed in your terminal.`;

  const mockCommandRowZh = options.includeMock ? '| `pnpm run remove-mock` | 移除 Mock 服务 |' : '';
  const mockCommandRowEn = options.includeMock
    ? '| `pnpm run remove-mock` | Remove mock server |'
    : '';

  const { apiSectionZh, apiSectionEn } = buildApiSections(options.openApiRelativePath);

  if (options.includeMock) {
    return {
      devServerNoteZh,
      devServerNoteEn,
      mockCommandRowZh,
      mockCommandRowEn,
      mockSectionZh: `## Mock 服务（已包含）

本仓库 **已包含** \`apps/backend-mock\`（Nitro Mock）。\`pnpm dev\` 时会随 Vite 插件启动 Mock API：

- Mock 基址：**http://localhost:5320/api**
- 开关：根目录 \`.env.development\` → \`VITE_NITRO_MOCK=true\`

### 移除 Mock 服务

本仓库附带 [\`scripts/remove-mock.mjs\`](./scripts/remove-mock.mjs)。不再需要 Mock 时：

1. 运行 \`pnpm run remove-mock\`（或 \`node scripts/remove-mock.mjs\`）
2. 执行 \`pnpm install\` 后 \`pnpm dev\`，对接真实后端（修改 \`VITE_GLOB_API_URL\` 等）

也可手动：在 \`.env.development\` 设置 \`VITE_NITRO_MOCK=false\` 并删除 \`apps/backend-mock/\`。

若不再需要该脚本，删除 \`scripts/remove-mock.mjs\` 并从 \`package.json\` 移除 \`remove-mock\` 命令即可。`,
      mockSectionEn: `## Mock server (included)

This repo **includes** \`apps/backend-mock\` (Nitro Mock). Running \`pnpm dev\` starts the mock API via the Vite plugin:

- Mock base URL: **http://localhost:5320/api**
- Toggle: \`.env.development\` → \`VITE_NITRO_MOCK=true\`

### Remove mock server

This repo includes [\`scripts/remove-mock.mjs\`](./scripts/remove-mock.mjs). When you no longer need mock:

1. Run \`pnpm run remove-mock\` (or \`node scripts/remove-mock.mjs\`)
2. Run \`pnpm install\`, then \`pnpm dev\`, and point \`VITE_GLOB_API_URL\` to your real API

Or manually: set \`VITE_NITRO_MOCK=false\` and delete \`apps/backend-mock/\`.

If you no longer need the helper, delete \`scripts/remove-mock.mjs\` and remove the \`remove-mock\` script from \`package.json\`.`,
      apiSectionZh,
      apiSectionEn,
    };
  }

  return {
    devServerNoteZh,
    devServerNoteEn,
    mockCommandRowZh,
    mockCommandRowEn,
    mockSectionZh: `## Mock 服务（未包含）

生成时 **未包含** \`apps/backend-mock\`。本地开发请对接真实后端，或使用 Apifox / Postman 等导入下方 OpenAPI 参考文档自建 Mock。

- \`.env.development\` 中 \`VITE_NITRO_MOCK=false\`（已写入）
- 接口前缀：\`VITE_GLOB_API_URL\`（默认 \`/api\`）— 需在 Vite 代理或网关指向你的服务`,
    mockSectionEn: `## Mock server (not included)

\`apps/backend-mock\` was **not** copied. Use a real backend in development, or import the OpenAPI reference below into Apifox / Postman.

- \`VITE_NITRO_MOCK=false\` in \`.env.development\` (already set)
- API prefix: \`VITE_GLOB_API_URL\` (default \`/api\`) — point Vite proxy or your gateway to your service`,
    apiSectionZh,
    apiSectionEn,
  };
}

function buildApiSections(openApiRelativePath?: string) {
  const openApiPath = openApiRelativePath ?? 'docs/mock-api.openapi.json';

  return {
    apiSectionZh: `## API 参考（OpenAPI）

已从 upstream \`backend-mock\` 路由生成 **OpenAPI 3.0** 清单（仅作接口参考，不含 handler 实现）：

- 文件：[\`${openApiPath}\`](./${openApiPath})
- 默认 Mock 基址：**http://localhost:5320/api**

导入 Apifox：项目设置 → 导入 → OpenAPI → 选择上述 JSON 文件。`,
    apiSectionEn: `## API reference (OpenAPI)

An **OpenAPI 3.0** route inventory was generated from upstream \`backend-mock\` (reference only, no handler code):

- File: [\`${openApiPath}\`](./${openApiPath})
- Default mock base URL: **http://localhost:5320/api**

Import into Apifox: Project settings → Import → OpenAPI → select the JSON file.`,
  };
}

async function renderTemplate(filename: string, vars: Record<string, string>): Promise<string> {
  let content = await readFile(join(GENERATED_DIR, filename), 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

export async function appendRemoveMockScriptToPackageJson(targetDir: string): Promise<void> {
  const packageJsonPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    scripts?: Record<string, string>;
  };

  pkg.scripts = {
    ...pkg.scripts,
    'remove-mock': 'node scripts/remove-mock.mjs',
  };

  await writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}
