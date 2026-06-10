import { copyFile, mkdir } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { pathExists } from '../utils/fs.js';
import type { GenerationPlan } from '../extract/types.js';
import { ensureParentDirectories } from './transform-package-json.js';

export async function writeGenerationPlan(plan: GenerationPlan): Promise<void> {
  const targetRoot = resolve(plan.targetDir);
  await mkdir(targetRoot, { recursive: true });

  for (const entry of plan.files) {
    if (!(await pathExists(entry.sourcePath))) {
      if (entry.sourcePath.endsWith('.npmrc')) {
        continue;
      }
      throw new Error(`Missing upstream file during generation: ${entry.sourcePath}`);
    }

    const targetPath = resolve(entry.targetPath);
    assertPathInsideRoot(targetRoot, targetPath);

    await ensureParentDirectories(targetPath);
    await copyFile(entry.sourcePath, targetPath);
  }
}

function assertPathInsideRoot(rootDir: string, targetPath: string): void {
  const relativePath = relative(rootDir, targetPath);
  if (relativePath.startsWith('..') || relativePath === '..') {
    throw new Error(`Refusing to write outside project directory: ${targetPath}`);
  }
}

export function summarizeGenerationPlan(plan: GenerationPlan): string {
  const lines = [
    `Template: ${plan.templateId}`,
    `Upstream ref: ${plan.ref}`,
    `Target: ${plan.targetDir}`,
    `Mock server: ${plan.includeMock ? 'included' : 'excluded'}`,
    `Packages: ${plan.closure.packages.length}`,
    `Files: ${plan.files.length}`,
    '',
    ...plan.closure.packages.map((pkg) => `- ${pkg.name} (${pkg.relativeDir})`),
  ];

  return lines.join('\n');
}
