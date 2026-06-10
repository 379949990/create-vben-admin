import { readFileSync } from 'node:fs';
import * as p from '@clack/prompts';
import { execa } from 'execa';
import type { ResolvedCliOptions } from '../cli/resolve-options.js';
import { getPackagePath } from '../core/package-root.js';
import { fetchUpstreamSnapshot } from '../extract/fetch-upstream.js';
import { parseWorkspaceManifest } from '../extract/parse-workspace.js';
import { resolveDependencyClosure } from '../extract/resolve-deps.js';
import { assertSafeProjectTarget } from '../utils/project-path.js';
import { assertWritableTargetDirectory } from '../utils/fs.js';
import { planFlatGeneration } from './flatten.js';
import {
  patchDevelopmentEnv,
  readDevelopmentPort,
  writeMockOpenApiFromUpstream,
  writeRemoveMockScript,
} from './project-extras.js';
import { transformGeneratedPackageJsons } from './transform-package-json.js';
import { appendRemoveMockScriptToPackageJson, writeGeneratedReadme } from './write-readme.js';
import { assertVendorBuildArtifacts, runWorkspaceStub } from './vendor-stub.js';
import { summarizeGenerationPlan, writeGenerationPlan } from './write-files.js';

const templatesDir = getPackagePath('templates');
const createVbenVersion = JSON.parse(readFileSync(getPackagePath('package.json'), 'utf8')) as {
  version: string;
};

export async function createProject(options: ResolvedCliOptions): Promise<void> {
  assertSafeProjectTarget(options.targetDir);

  if (!options.dryRun) {
    await assertWritableTargetDirectory(options.targetDir, options.force);
  }

  const fetchSpinner = p.spinner();
  fetchSpinner.start(`Fetching upstream (${options.ref || 'latest release'})…`);

  let upstreamRoot: string;
  let resolvedRef: string;

  try {
    const fetched = await fetchUpstreamSnapshot({
      ref: options.ref,
      offline: options.offline,
    });
    upstreamRoot = fetched.rootDir;
    resolvedRef = fetched.ref;
    fetchSpinner.stop(`Upstream ready @ ${resolvedRef}`);
  } catch (error) {
    fetchSpinner.stop('Failed to fetch upstream');
    throw error;
  }

  const manifest = await parseWorkspaceManifest(upstreamRoot);
  const closure = resolveDependencyClosure(manifest, options.template, {
    includeMock: options.includeMock,
  });
  const plan = await planFlatGeneration({
    upstreamRoot,
    targetDir: options.targetDir,
    templateId: options.template,
    ref: resolvedRef,
    includeMock: options.includeMock,
    closure,
    manifest,
  });

  if (options.dryRun) {
    p.log.info(summarizeGenerationPlan(plan));
    return;
  }

  const writeSpinner = p.spinner();
  writeSpinner.start('Writing project files…');

  let openApiRelativePath: string | undefined;

  try {
    await writeGenerationPlan(plan);
    await transformGeneratedPackageJsons({
      plan,
      manifest,
      packageName: options.packageName,
    });
    await patchDevelopmentEnv({
      targetDir: options.targetDir,
      includeMock: options.includeMock,
    });

    const openApiPath = await writeMockOpenApiFromUpstream({
      upstreamRoot,
      targetDir: options.targetDir,
    });
    openApiRelativePath = openApiPath ? openApiPath.slice(options.targetDir.length + 1) : undefined;

    await writeRemoveMockScript({ templatesDir, targetDir: options.targetDir });
    await appendRemoveMockScriptToPackageJson(options.targetDir);

    const devPort = await readDevelopmentPort(options.targetDir);

    await writeGeneratedReadme({
      targetDir: options.targetDir,
      packageName: options.packageName,
      templateId: options.template,
      ref: resolvedRef,
      createVbenVersion: createVbenVersion.version,
      includeMock: options.includeMock,
      devPort,
      openApiRelativePath,
    });
    writeSpinner.stop('Project files written');
  } catch (error) {
    writeSpinner.stop('Failed to write project');
    throw error;
  }

  const installSpinner = p.spinner();
  installSpinner.start('Running pnpm install…');

  try {
    await execa('pnpm', ['install'], {
      cwd: options.targetDir,
      stdio: 'inherit',
    });
    installSpinner.stop('Dependencies installed');
  } catch (error) {
    installSpinner.stop('pnpm install failed');
    throw new Error(
      [
        `pnpm install failed in ${options.targetDir}.`,
        'Project files were written but the scaffold is not ready.',
        'Fix install errors above, then run:',
        `  cd ${options.targetDir} && pnpm install`,
      ].join('\n'),
      { cause: error },
    );
  }

  const stubSpinner = p.spinner();
  stubSpinner.start('Building workspace vendor packages (stub)…');

  try {
    await runWorkspaceStub(options.targetDir);
    await assertVendorBuildArtifacts(options.targetDir);
    stubSpinner.stop('Vendor packages built');
  } catch (error) {
    stubSpinner.stop('Vendor stub failed');
    throw new Error(
      [
        `Workspace stub/build failed in ${options.targetDir}.`,
        'Without built vendor packages (e.g. @vben/vite-config/dist), pnpm dev will not start.',
        'After fixing errors above, run:',
        `  cd ${options.targetDir} && pnpm -r run stub --if-present`,
      ].join('\n'),
      { cause: error },
    );
  }

  p.outro(`Done! Run:\n  cd ${options.targetDir}\n  pnpm dev`);
}
