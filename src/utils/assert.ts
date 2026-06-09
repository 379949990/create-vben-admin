/** Shared path / exec helpers — populated in later CV1-* steps. */

export function assertSafeProjectName(name: string): void {
  if (!name.trim()) {
    throw new Error('Project name is required');
  }
  if (name.includes('..') || name.includes('/') || name.includes('\\')) {
    throw new Error('Project name must not contain path separators');
  }
}
