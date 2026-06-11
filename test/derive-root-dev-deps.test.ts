import { join } from 'node:path';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { parseWorkspaceManifest } from '../src/extract/parse-workspace.js';
import { resolveDependencyClosure } from '../src/extract/resolve-deps.js';
import {
  deriveHoistedRootDevDependencyNames,
  pickHoistedRootDevDependencies,
} from '../src/generate/derive-root-dev-deps.js';
import { resolveDependencySpec } from '../src/generate/transform-package-json.js';
import { assertWritableTargetDirectory } from '../src/utils/fs.js';
import { assertSafeProjectTarget } from '../src/utils/project-path.js';

const fixtureRoot = join(import.meta.dirname, 'fixtures/upstream-mini');

describe('deriveHoistedRootDevDependencyNames', () => {
  it('collects stub and app tooling from closure scripts', async () => {
    const manifest = await parseWorkspaceManifest(fixtureRoot);
    const closure = resolveDependencyClosure(manifest, 'web-naive');
    const templatePackage = manifest.packageByName.get('@vben/web-naive')!;

    const names = deriveHoistedRootDevDependencyNames(closure, templatePackage);

    expect(names.has('tsdown')).toBe(true);
    expect(names.has('typescript')).toBe(true);
    expect(names.has('@types/node')).toBe(true);
    expect(names.has('vite')).toBe(true);
    expect(names.has('vue-tsc')).toBe(true);
  });
});

describe('pickHoistedRootDevDependencies', () => {
  it('resolves hoisted tools from upstream root devDependencies', async () => {
    const manifest = await parseWorkspaceManifest(fixtureRoot);
    const closure = resolveDependencyClosure(manifest, 'web-naive');
    const templatePackage = manifest.packageByName.get('@vben/web-naive')!;
    const upstreamRoot = JSON.parse(
      await (await import('node:fs/promises')).readFile(join(fixtureRoot, 'package.json'), 'utf8'),
    ) as { devDependencies: Record<string, string> };

    const picked = pickHoistedRootDevDependencies({
      closure,
      templatePackage,
      upstreamRootDevDependencies: upstreamRoot.devDependencies,
      catalog: manifest.catalog,
      resolveSpec: (name, spec) => resolveDependencySpec(name, spec, manifest.catalog),
    });

    expect(picked.tsdown).toBe('^0.12.0');
    expect(picked['@types/node']).toBe('^22.0.0');
    expect(picked.vite).toBe('^7.0.0');
    expect(picked['vue-tsc']).toBe('^3.0.0');
    expect(picked['@vben/vite-config']).toBeUndefined();
  });
});

describe('CLI path and directory guards', () => {
  it('rejects relative project paths', () => {
    expect(() => assertSafeProjectTarget('my-vben-admin')).toThrow(/must be absolute/);
  });

  it('rejects empty project paths', () => {
    expect(() => assertSafeProjectTarget('   ')).toThrow(/Project path is required/);
  });

  it('rejects non-empty target without --force', async () => {
    const { mkdtemp } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const dir = await mkdtemp(join(tmpdir(), 'create-vben-admin-boundary-'));
    await writeFile(join(dir, 'keep.txt'), 'x', 'utf8');

    await expect(assertWritableTargetDirectory(dir, false)).rejects.toThrow(/not empty/);

    await rm(dir, { recursive: true, force: true });
  });

  it('allows non-empty target when --force is set', async () => {
    const { mkdtemp } = await import('node:fs/promises');
    const { tmpdir } = await import('node:os');
    const dir = await mkdtemp(join(tmpdir(), 'create-vben-admin-boundary-'));
    await mkdir(join(dir, 'nested'), { recursive: true });

    await expect(assertWritableTargetDirectory(dir, true)).resolves.toBeUndefined();

    await rm(dir, { recursive: true, force: true });
  });
});
