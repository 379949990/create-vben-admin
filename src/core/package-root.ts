import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Resolve create-vben package root (directory containing package.json). */
export function getPackageRoot(moduleUrl: string = import.meta.url): string {
  const moduleDir = dirname(fileURLToPath(moduleUrl));

  if (basename(moduleDir) === 'dist') {
    return dirname(moduleDir);
  }

  // tsx source layout: src/cli, src/generate, …
  return join(moduleDir, '../..');
}

export function getPackagePath(...segments: string[]): string {
  return join(getPackageRoot(), ...segments);
}
