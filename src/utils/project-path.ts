import { homedir } from 'node:os';
import { basename, isAbsolute, join, normalize, resolve } from 'node:path';

export const DEFAULT_PROJECT_DIR_NAME = 'my-vben-admin';

export interface ResolvedProjectTarget {
  targetDir: string;
  packageName: string;
}

export function getDefaultProjectTargetPath(): string {
  return join(homedir(), 'Downloads', DEFAULT_PROJECT_DIR_NAME);
}

export function resolveProjectTarget(
  input: string | undefined,
  cwd: string = process.cwd(),
): ResolvedProjectTarget {
  if (!input?.trim()) {
    const targetDir = normalize(getDefaultProjectTargetPath());
    return { targetDir, packageName: sanitizePackageName(basename(targetDir)) };
  }

  const trimmed = input.trim();
  let targetDir: string;

  if (isAbsolute(trimmed)) {
    targetDir = normalize(trimmed);
  } else if (trimmed.includes('/') || trimmed.includes('\\')) {
    targetDir = normalize(resolve(cwd, trimmed));
  } else {
    targetDir = normalize(join(homedir(), 'Downloads', trimmed));
  }

  return {
    targetDir,
    packageName: sanitizePackageName(basename(targetDir)),
  };
}

export function assertSafeProjectTarget(targetDir: string): void {
  const normalized = normalize(targetDir);

  if (!normalized.trim()) {
    throw new Error('Project path is required');
  }

  if (!isAbsolute(normalized)) {
    throw new Error('Project path must be absolute');
  }

  if (normalized.split(/[/\\]/).includes('..')) {
    throw new Error('Project path must not contain ".." segments');
  }
}

export function sanitizePackageName(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return sanitized || 'my-vben-app';
}
