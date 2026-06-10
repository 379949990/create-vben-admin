import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CREATE_VBEN_META } from '../core/meta.js';
import { type VbenTemplateId } from '../core/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GENERATED_README_DIR = join(__dirname, '../../templates/generated');

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
}): Promise<void> {
  const labels = TEMPLATE_LABELS[options.templateId];
  const vars = {
    packageName: options.packageName,
    templateId: options.templateId,
    templateLabelZh: labels.zh,
    templateLabelEn: labels.en,
    ref: options.ref,
    createVbenVersion: options.createVbenVersion,
    createVbenRepo: CREATE_VBEN_META.repository,
    upstreamRepo: 'https://github.com/vbenjs/vue-vben-admin',
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

async function renderTemplate(filename: string, vars: Record<string, string>): Promise<string> {
  let content = await readFile(join(GENERATED_README_DIR, filename), 'utf8');
  for (const [key, value] of Object.entries(vars)) {
    content = content.replaceAll(`{{${key}}}`, value);
  }
  return content;
}

async function writeFile(path: string, content: string, encoding: BufferEncoding): Promise<void> {
  const { writeFile: write } = await import('node:fs/promises');
  await write(path, content, encoding);
}
