import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as p from '@clack/prompts';
import { execa } from 'execa';
import type { ResolvedCliOptions } from '../cli/resolve-options.js';
import { fetchUpstreamSnapshot } from '../extract/fetch-upstream.js';
import { parseWorkspaceManifest } from '../extract/parse-workspace.js';
import { resolveDependencyClosure } from '../extract/resolve-deps.js';
import { assertSafeProjectTarget } from '../utils/project-path.js';
import { assertWritableTargetDirectory } from '../utils/fs.js';
import { planFlatGeneration } from './flatten.js';
import { transformGeneratedPackageJsons } from './transform-package-json.js';
import { writeGeneratedReadme } from './write-readme.js';
import { summarizeGenerationPlan, writeGenerationPlan } from './write-files.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const createVbenVersion = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf8'),
) as { version: string };

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
  const closure = resolveDependencyClosure(manifest, options.template);
  const plan = await planFlatGeneration({
    upstreamRoot,
    targetDir: options.targetDir,
    templateId: options.template,
    ref: resolvedRef,
    closure,
    manifest,
  });

  if (options.dryRun) {
    p.log.info(summarizeGenerationPlan(plan));
    return;
  }

  const writeSpinner = p.spinner();
  writeSpinner.start('Writing project files…');

  try {
    await writeGenerationPlan(plan);
    await transformGeneratedPackageJsons({
      plan,
      manifest,
      packageName: options.packageName,
    });
    await writeGeneratedReadme({
      targetDir: options.targetDir,
      packageName: options.packageName,
      templateId: options.template,
      ref: resolvedRef,
      createVbenVersion: createVbenVersion.version,
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
  } catch {
    installSpinner.stop('pnpm install failed');
    p.log.warn(
      `Project was created at ${options.targetDir}, but pnpm install failed. Run "cd ${options.targetDir} && pnpm install" manually.`,
    );
    p.outro(`Project created at ${options.targetDir}. Fix install, then run pnpm dev.`);
    return;
  }

  p.outro(`Done! Run:\n  cd ${options.targetDir}\n  pnpm dev`);
}
