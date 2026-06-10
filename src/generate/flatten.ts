import { readdir, lstat } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { VBEN_TEMPLATE_PACKAGE_NAME, type VbenTemplateId } from '../core/constants.js';
import { COPY_IGNORE } from '../utils/fs.js';
import type {
  DependencyClosure,
  FileCopyEntry,
  GenerationPlan,
  WorkspaceManifest,
} from '../extract/types.js';

const ROOT_FILES = ['pnpm-workspace.yaml', '.npmrc'];

export async function planFlatGeneration(options: {
  upstreamRoot: string;
  targetDir: string;
  templateId: VbenTemplateId;
  ref: string;
  closure: DependencyClosure;
  manifest: WorkspaceManifest;
}): Promise<GenerationPlan> {
  const templatePackageName = VBEN_TEMPLATE_PACKAGE_NAME[options.templateId];
  const templatePackage = options.manifest.packageByName.get(templatePackageName);

  if (!templatePackage) {
    throw new Error(`Template package "${templatePackageName}" not found while planning output.`);
  }

  const files: FileCopyEntry[] = [];

  for (const rootFile of ROOT_FILES) {
    files.push({
      sourcePath: join(options.upstreamRoot, rootFile),
      targetPath: join(options.targetDir, rootFile),
    });
  }

  for (const pkg of options.closure.packages) {
    if (pkg.name === templatePackageName) {
      const appFiles = await collectDirectoryFiles(pkg.dir);
      for (const sourcePath of appFiles) {
        const relativePath = relative(pkg.dir, sourcePath);
        files.push({
          sourcePath,
          targetPath: join(options.targetDir, relativePath),
        });
      }
      continue;
    }

    const packageFiles = await collectDirectoryFiles(pkg.dir);
    for (const sourcePath of packageFiles) {
      const relativePath = relative(options.upstreamRoot, sourcePath);
      files.push({
        sourcePath,
        targetPath: join(options.targetDir, relativePath),
      });
    }
  }

  return {
    upstreamRoot: options.upstreamRoot,
    targetDir: options.targetDir,
    templateId: options.templateId,
    templatePackageName,
    ref: options.ref,
    files,
    closure: options.closure,
  };
}

async function collectDirectoryFiles(rootDir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (COPY_IGNORE.has(entry.name)) {
        continue;
      }

      const absolutePath = join(currentDir, entry.name);
      const stats = await lstat(absolutePath);
      if (stats.isSymbolicLink()) {
        continue;
      }

      if (stats.isDirectory()) {
        await walk(absolutePath);
        continue;
      }

      files.push(absolutePath);
    }
  }

  await walk(rootDir);
  return files;
}
