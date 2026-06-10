import { access, readdir } from 'node:fs/promises';

export async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export async function directoryIsEmpty(path: string): Promise<boolean> {
  if (!(await pathExists(path))) {
    return true;
  }

  const entries = await readdir(path);
  return entries.length === 0;
}

export async function assertWritableTargetDirectory(
  targetDir: string,
  force: boolean,
): Promise<void> {
  if (await directoryIsEmpty(targetDir)) {
    return;
  }

  if (!force) {
    throw new Error(`Target directory "${targetDir}" is not empty. Use --force to overwrite.`);
  }
}

export const COPY_IGNORE = new Set([
  'node_modules',
  '.git',
  '.cursor',
  'dist',
  '.turbo',
  '.cache',
  'coverage',
]);
