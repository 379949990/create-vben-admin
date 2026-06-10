import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PROJECT_DIR_NAME,
  getDefaultProjectTargetPath,
  resolveProjectTarget,
  sanitizePackageName,
} from '../src/utils/project-path.js';

describe('project-path', () => {
  it('defaults to Downloads/my-vben-admin', () => {
    expect(getDefaultProjectTargetPath()).toMatch(/Downloads[/\\]my-vben-admin$/);
  });

  it('resolves simple names under Downloads', () => {
    const { targetDir, packageName } = resolveProjectTarget('my-vben-app', '/tmp/cwd');
    expect(targetDir).toMatch(/Downloads[/\\]my-vben-app$/);
    expect(packageName).toBe('my-vben-app');
  });

  it('resolves absolute paths', () => {
    const { targetDir, packageName } = resolveProjectTarget('/tmp/my-project', '/tmp/cwd');
    expect(targetDir).toBe('/tmp/my-project');
    expect(packageName).toBe('my-project');
  });

  it('sanitizes npm package names', () => {
    expect(sanitizePackageName('My-Vben App')).toBe('my-vben-app');
    expect(sanitizePackageName(DEFAULT_PROJECT_DIR_NAME)).toBe('my-vben-admin');
  });
});
