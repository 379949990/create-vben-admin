#!/usr/bin/env node
/**
 * Flat-layout project slimming helper.
 * Adapted from https://doc.vben.pro/guide/introduction/thin.html
 *
 * Usage:
 *   node scripts/thin-project.mjs --remove-mock    Remove apps/backend-mock + disable VITE_NITRO_MOCK
 *   node scripts/thin-project.mjs --help
 */
import { existsSync } from 'node:fs';
import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const args = process.argv.slice(2);

function printHelp() {
  console.log(`thin-project.mjs — slim a create-vben flat scaffold

Options:
  --remove-mock   Delete apps/backend-mock and set VITE_NITRO_MOCK=false in .env.development
  --help          Show this help

Reference: https://doc.vben.pro/guide/introduction/thin.html
`);
}

async function patchMockEnv(enabled) {
  const envPath = join(root, '.env.development');
  if (!existsSync(envPath)) {
    console.warn('Skip env patch: .env.development not found');
    return;
  }

  let content = await readFile(envPath, 'utf8');
  const value = enabled ? 'true' : 'false';

  if (/^VITE_NITRO_MOCK=.*$/m.test(content)) {
    content = content.replace(/^VITE_NITRO_MOCK=.*$/m, `VITE_NITRO_MOCK=${value}`);
  } else {
    content = `${content.trimEnd()}\nVITE_NITRO_MOCK=${value}\n`;
  }

  await writeFile(envPath, content, 'utf8');
  console.log(`Updated VITE_NITRO_MOCK=${value} in .env.development`);
}

async function removeMock() {
  const mockDir = join(root, 'apps/backend-mock');
  if (existsSync(mockDir)) {
    await rm(mockDir, { recursive: true, force: true });
    console.log('Removed apps/backend-mock/');
  } else {
    console.log('apps/backend-mock/ not present — skipped');
  }

  await patchMockEnv(false);
  console.log('Next: pnpm install && pnpm dev');
}

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    return;
  }

  if (args.includes('--remove-mock')) {
    await removeMock();
    return;
  }

  console.error('Unknown option. Run with --help');
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
