import { join } from 'node:path';
import { execa } from 'execa';
import { pathExists } from '../utils/fs.js';

/** Must exist after workspace stub — gates `pnpm dev` / vite config load. */
export const VENDOR_BUILD_MARKERS = [
  {
    packageName: '@vben/vite-config',
    relativePath: 'internal/vite-config/dist/index.mjs',
  },
  {
    packageName: '@vben/node-utils',
    relativePath: 'internal/node-utils/dist/index.mjs',
  },
] as const;

export async function runWorkspaceStub(targetDir: string): Promise<void> {
  await execa('pnpm', ['-r', 'run', 'stub', '--if-present'], {
    cwd: targetDir,
    stdio: 'inherit',
  });
}

export async function getMissingVendorBuildArtifacts(targetDir: string): Promise<string[]> {
  const missing: string[] = [];

  for (const marker of VENDOR_BUILD_MARKERS) {
    const absolutePath = join(targetDir, marker.relativePath);
    if (!(await pathExists(absolutePath))) {
      missing.push(`${marker.packageName} → ${marker.relativePath}`);
    }
  }

  return missing;
}

export async function assertVendorBuildArtifacts(targetDir: string): Promise<void> {
  const missing = await getMissingVendorBuildArtifacts(targetDir);

  if (missing.length === 0) {
    return;
  }

  throw new Error(
    [
      'Vendor workspace packages were not built successfully.',
      'Missing artifacts:',
      ...missing.map((entry) => `  - ${entry}`),
      '',
      'Try re-running: pnpm -r run stub --if-present',
    ].join('\n'),
  );
}
