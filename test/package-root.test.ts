import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getPackagePath, getPackageRoot } from '../src/core/package-root.js';

describe('getPackageRoot', () => {
  it('resolves package.json from source module layout', () => {
    const pkg = JSON.parse(readFileSync(getPackagePath('package.json'), 'utf8')) as {
      name: string;
    };
    expect(pkg.name).toBe('create-vben');
  });

  it('resolves dist layout like a published bundle', () => {
    const fakeDistIndex = join(getPackageRoot(), 'dist/index.js');
    const root = getPackageRoot(`file://${fakeDistIndex}`);
    expect(readFileSync(join(root, 'package.json'), 'utf8')).toContain('"name": "create-vben"');
  });

  it('resolves templates directory', () => {
    const templatesDir = getPackagePath('templates');
    expect(readFileSync(join(templatesDir, 'README.md'), 'utf8')).toContain('templates');
  });
});
