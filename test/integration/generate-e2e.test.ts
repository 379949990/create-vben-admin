import { readFile } from 'node:fs/promises';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseWorkspaceManifest } from '../../src/extract/parse-workspace.js';
import { resolveDependencyClosure } from '../../src/extract/resolve-deps.js';
import { planFlatGeneration } from '../../src/generate/flatten.js';
import {
  patchDevelopmentEnv,
  writeMockOpenApiFromUpstream,
  writeRemoveMockScript,
} from '../../src/generate/project-extras.js';
import { transformGeneratedPackageJsons } from '../../src/generate/transform-package-json.js';
import {
  appendRemoveMockScriptToPackageJson,
  writeGeneratedReadme,
} from '../../src/generate/write-readme.js';
import { writeGenerationPlan } from '../../src/generate/write-files.js';

const fixtureRoot = join(import.meta.dirname, '../fixtures/upstream-mini');
const templatesDir = join(import.meta.dirname, '../../templates');

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function createTargetDir(): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), 'create-vben-admin-e2e-'));
  tempDirs.push(dir);
  return dir;
}

async function generateFromFixture(options: {
  targetDir: string;
  includeMock: boolean;
}): Promise<void> {
  const manifest = await parseWorkspaceManifest(fixtureRoot);
  const closure = resolveDependencyClosure(manifest, 'web-naive', {
    includeMock: options.includeMock,
  });
  const plan = await planFlatGeneration({
    upstreamRoot: fixtureRoot,
    targetDir: options.targetDir,
    templateId: 'web-naive',
    ref: 'fixture',
    includeMock: options.includeMock,
    closure,
    manifest,
  });

  await writeGenerationPlan(plan);
  await transformGeneratedPackageJsons({
    plan,
    manifest,
    packageName: 'my-vben-app',
  });
  await patchDevelopmentEnv({
    targetDir: options.targetDir,
    includeMock: options.includeMock,
  });

  const openApiPath = await writeMockOpenApiFromUpstream({
    upstreamRoot: fixtureRoot,
    targetDir: options.targetDir,
  });

  expect(openApiPath).toBeDefined();

  await writeRemoveMockScript({ templatesDir, targetDir: options.targetDir });
  await appendRemoveMockScriptToPackageJson(options.targetDir);
  await writeGeneratedReadme({
    targetDir: options.targetDir,
    packageName: 'my-vben-app',
    templateId: 'web-naive',
    ref: 'fixture',
    createVbenAdminVersion: '1.0.1',
    includeMock: options.includeMock,
    devPort: '5888',
    openApiRelativePath: openApiPath!.slice(options.targetDir.length + 1),
  });
}

describe('generate project (integration)', () => {
  it('writes flat web-naive scaffold without mock', async () => {
    const targetDir = await createTargetDir();
    await generateFromFixture({ targetDir, includeMock: false });

    const readme = await readFile(join(targetDir, 'README.md'), 'utf8');
    const openApi = JSON.parse(
      await readFile(join(targetDir, 'docs/mock-api.openapi.json'), 'utf8'),
    ) as { paths: Record<string, unknown> };

    expect(openApi.paths['/api/auth/login']).toBeDefined();
    expect(openApi.paths['/api/menu/list']).toBeDefined();
    expect(readme).toContain('API 参考（OpenAPI）');
    expect(readme).toContain('Mock 服务（未包含）');
    expect(readme).not.toContain('pnpm run remove-mock');
  });

  it('writes flat web-naive scaffold with mock and OpenAPI', async () => {
    const targetDir = await createTargetDir();
    await generateFromFixture({ targetDir, includeMock: true });

    const readme = await readFile(join(targetDir, 'README.md'), 'utf8');
    const pkg = JSON.parse(await readFile(join(targetDir, 'package.json'), 'utf8')) as {
      name: string;
      scripts: Record<string, string>;
    };

    expect(pkg.name).toBe('my-vben-app');
    expect(pkg.scripts['remove-mock']).toBe('node scripts/remove-mock.mjs');
    expect(readme).toContain('Mock 服务（已包含）');
    expect(readme).toContain('API 参考（OpenAPI）');
    expect(readme).toContain('pnpm run remove-mock');
  });
});
