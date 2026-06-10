import { readFileSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREATE_VBEN_META } from '../core/meta.js';
import { type VbenTemplateId } from '../core/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_DIR = join(__dirname, '../../templates/generated');

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
    mockSectionZh: sections.mockSectionZh,
    mockSectionEn: sections.mockSectionEn,
    apiSectionZh: sections.apiSectionZh,
    apiSectionEn: sections.apiSectionEn,
    thinSectionZh: sections.thinSectionZh,
    thinSectionEn: sections.thinSectionEn,
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

  const thinSectionZh = `## 项目精简

本仓库附带 [\`scripts/thin-project.mjs\`](./scripts/thin-project.mjs)，参考 [Vben 官方精简说明](https://doc.vben.pro/guide/introduction/thin.html)（适配 create-vben 扁平布局）。

| 命令 | 作用 |
| --- | --- |
| \`node scripts/thin-project.mjs --remove-mock\` | 删除 \`apps/backend-mock/\` 并设置 \`VITE_NITRO_MOCK=false\` |

若你**不需要**该脚本，可直接删除 \`scripts/thin-project.mjs\`，不影响日常开发。`;

  const thinSectionEn = `## Project slimming

This repo includes [\`scripts/thin-project.mjs\`](./scripts/thin-project.mjs), adapted from the [official Vben thin guide](https://doc.vben.pro/guide/introduction/thin.html) for create-vben flat layout.

| Command | Purpose |
| --- | --- |
| \`node scripts/thin-project.mjs --remove-mock\` | Remove \`apps/backend-mock/\` and set \`VITE_NITRO_MOCK=false\` |

If you do not need the helper, delete \`scripts/thin-project.mjs\` — it is optional.`;

  if (options.includeMock) {
    return {
      devServerNoteZh,
      devServerNoteEn,
      mockSectionZh: `## Mock 服务（已包含）

本仓库 **已包含** \`apps/backend-mock\`（Nitro Mock）。\`pnpm dev\` 时会随 Vite 插件启动 Mock API：

- Mock 基址：**http://localhost:5320/api**
- 开关：根目录 \`.env.development\` → \`VITE_NITRO_MOCK=true\`

### 不再需要 Mock 时

1. 运行 \`node scripts/thin-project.mjs --remove-mock\`
2. 或在 \`.env.development\` 设置 \`VITE_NITRO_MOCK=false\` 并手动删除 \`apps/backend-mock/\`
3. 执行 \`pnpm install\` 后重新 \`pnpm dev\`，对接你的真实后端（修改 \`VITE_GLOB_API_URL\` 等）`,
      mockSectionEn: `## Mock server (included)

This repo **includes** \`apps/backend-mock\` (Nitro Mock). Running \`pnpm dev\` starts the mock API via the Vite plugin:

- Mock base URL: **http://localhost:5320/api**
- Toggle: \`.env.development\` → \`VITE_NITRO_MOCK=true\`

### When you no longer need mock

1. Run \`node scripts/thin-project.mjs --remove-mock\`
2. Or set \`VITE_NITRO_MOCK=false\` and delete \`apps/backend-mock/\` manually
3. Run \`pnpm install\`, then \`pnpm dev\`, and point \`VITE_GLOB_API_URL\` to your real API`,
      apiSectionZh: '',
      apiSectionEn: '',
      thinSectionZh,
      thinSectionEn,
    };
  }

  const openApiPath = options.openApiRelativePath ?? 'docs/mock-api.openapi.json';

  return {
    devServerNoteZh,
    devServerNoteEn,
    mockSectionZh: `## Mock 服务（未包含）

生成时 **未包含** \`apps/backend-mock\`。本地开发请对接真实后端，或使用 Apifox / Postman 等导入下方 OpenAPI 参考文档自建 Mock。

- \`.env.development\` 中 \`VITE_NITRO_MOCK=false\`（已写入）
- 接口前缀：\`VITE_GLOB_API_URL\`（默认 \`/api\`）— 需在 Vite 代理或网关指向你的服务`,
    mockSectionEn: `## Mock server (not included)

\`apps/backend-mock\` was **not** copied. Use a real backend in development, or import the OpenAPI reference below into Apifox / Postman.

- \`VITE_NITRO_MOCK=false\` in \`.env.development\` (already set)
- API prefix: \`VITE_GLOB_API_URL\` (default \`/api\`) — point Vite proxy or your gateway to your service`,
    apiSectionZh: `## API 参考（OpenAPI）

已从 upstream \`backend-mock\` 路由生成 **OpenAPI 3.0** 清单（仅作接口参考，不含实现）：

- 文件：[\`${openApiPath}\`](./${openApiPath})
- 默认 Mock 基址（若自建）：\`http://localhost:5320/api\`

导入 Apifox：项目设置 → 导入 → OpenAPI → 选择上述 JSON 文件。`,
    apiSectionEn: `## API reference (OpenAPI)

An **OpenAPI 3.0** route inventory was generated from upstream \`backend-mock\` (reference only, no server):

- File: [\`${openApiPath}\`](./${openApiPath})
- Default mock base if you host one: \`http://localhost:5320/api\`

Import into Apifox: Project settings → Import → OpenAPI → select the JSON file.`,
    thinSectionZh,
    thinSectionEn,
  };
}

async function renderTemplate(filename: string, vars: Record<string, string>): Promise<string> {
  let content = await readFile(join(GENERATED_DIR, filename), 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

export async function appendThinScriptToPackageJson(targetDir: string): Promise<void> {
  const packageJsonPath = join(targetDir, 'package.json');
  const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
    scripts?: Record<string, string>;
  };

  pkg.scripts = {
    ...pkg.scripts,
    'thin:remove-mock': 'node scripts/thin-project.mjs --remove-mock',
  };

  await writeFile(packageJsonPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8');
}
