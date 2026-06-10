import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseWorkspaceManifest } from '../src/extract/parse-workspace.js';
import { resolveDependencyClosure } from '../src/extract/resolve-deps.js';
import { transformPackageJson } from '../src/generate/transform-package-json.js';

const fixtureRoot = join(import.meta.dirname, 'fixtures/upstream-mini');

describe('parseWorkspaceManifest', () => {
  it('indexes workspace packages and catalog entries from fixture', async () => {
    const manifest = await parseWorkspaceManifest(fixtureRoot);

    expect(manifest.packageByName.has('@vben/web-naive')).toBe(true);
    expect(manifest.packageByName.has('@vben/utils')).toBe(true);
    expect(manifest.catalog.vue).toBe('^3.5.0');

    const webNaive = manifest.packageByName.get('@vben/web-naive')!;
    expect(webNaive.dir).toBe(join(fixtureRoot, 'apps/web-naive'));
    expect(webNaive.relativeDir).toBe('apps/web-naive');
  });
});

describe('resolveDependencyClosure', () => {
  it('collects transitive workspace deps and build tooling for web-naive', async () => {
    const manifest = await parseWorkspaceManifest(fixtureRoot);
    const closure = resolveDependencyClosure(manifest, 'web-naive');

    expect(closure.packageNames.has('@vben/web-naive')).toBe(true);
    expect(closure.packageNames.has('@vben/utils')).toBe(true);
    expect(closure.packageNames.has('@vben-core/shared')).toBe(true);
    expect(closure.packageNames.has('@vben/vite-config')).toBe(true);
    expect(closure.packageNames.has('@vben/tsconfig')).toBe(true);
    expect(closure.packageNames.has('@vben/tailwind-config')).toBe(true);
    expect(closure.packageNames.has('@vben/backend-mock')).toBe(false);
  });

  it('does not fail when includeMock is true but mock package is absent in fixture', async () => {
    const manifest = await parseWorkspaceManifest(fixtureRoot);
    const closure = resolveDependencyClosure(manifest, 'web-naive', { includeMock: true });

    expect(closure.packageNames.has('@vben/backend-mock')).toBe(false);
    expect(closure.packageNames.has('@vben/web-naive')).toBe(true);
  });
});

describe('transformPackageJson', () => {
  it('resolves catalog: specs using dependency names', () => {
    const transformed = transformPackageJson(
      {
        name: '@vben/web-naive',
        dependencies: {
          vue: 'catalog:',
          '@vben/utils': 'workspace:*',
        },
      },
      { vue: '^3.5.0' },
      { name: 'my-app' },
    );

    expect(transformed.name).toBe('my-app');
    expect(transformed.dependencies?.vue).toBe('^3.5.0');
    expect(transformed.dependencies?.['@vben/utils']).toBe('workspace:*');
  });

  it('merges hoisted devDependencies for flat root package.json', () => {
    const transformed = transformPackageJson(
      { name: '@vben/web-naive', devDependencies: { '@vben/vite-config': 'workspace:*' } },
      {
        tsdown: '^0.12.0',
        '@tsdown/css': '^0.1.0',
        typescript: '^5.8.2',
        '@types/node': '^22.0.0',
        vite: '^7.0.0',
        'vue-tsc': '^3.0.0',
      },
      {
        devDependencies: {
          '@vben/vite-config': 'workspace:*',
          tsdown: '^0.12.0',
          '@tsdown/css': '^0.1.0',
          typescript: '^5.8.2',
          '@types/node': '^22.0.0',
          vite: '^7.0.0',
          'vue-tsc': '^3.0.0',
        },
      },
    );

    expect(transformed.devDependencies?.tsdown).toBe('^0.12.0');
    expect(transformed.devDependencies?.typescript).toBe('^5.8.2');
    expect(transformed.devDependencies?.['@types/node']).toBe('^22.0.0');
    expect(transformed.devDependencies?.vite).toBe('^7.0.0');
    expect(transformed.devDependencies?.['vue-tsc']).toBe('^3.0.0');
  });
});
