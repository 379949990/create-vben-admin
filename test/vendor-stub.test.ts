import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  assertVendorBuildArtifacts,
  getMissingVendorBuildArtifacts,
  VENDOR_BUILD_MARKERS,
} from '../src/generate/vendor-stub.js';

const tempRoots: string[] = [];

afterEach(async () => {
  const { rm } = await import('node:fs/promises');
  await Promise.all(tempRoots.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTempProjectRoot(): Promise<string> {
  const { mkdtemp } = await import('node:fs/promises');
  const { tmpdir } = await import('node:os');
  const dir = await mkdtemp(join(tmpdir(), 'create-vben-admin-vendor-'));
  tempRoots.push(dir);
  return dir;
}

describe('vendor build artifacts', () => {
  it('reports missing marker files', async () => {
    const root = await createTempProjectRoot();
    const missing = await getMissingVendorBuildArtifacts(root);

    expect(missing).toHaveLength(VENDOR_BUILD_MARKERS.length);
    expect(missing[0]).toContain('@vben/vite-config');
  });

  it('passes when required dist files exist', async () => {
    const root = await createTempProjectRoot();

    for (const marker of VENDOR_BUILD_MARKERS) {
      const filePath = join(root, marker.relativePath);
      await mkdir(join(filePath, '..'), { recursive: true });
      await writeFile(filePath, 'export {};\n', 'utf8');
    }

    await expect(assertVendorBuildArtifacts(root)).resolves.toBeUndefined();
    await expect(getMissingVendorBuildArtifacts(root)).resolves.toEqual([]);
  });

  it('throws with actionable message when artifacts are missing', async () => {
    const root = await createTempProjectRoot();

    await expect(assertVendorBuildArtifacts(root)).rejects.toThrow(
      /Vendor workspace packages were not built successfully/,
    );
  });
});
