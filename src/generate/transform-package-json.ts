import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import type { PackageJson } from '../extract/types.js';
import type { GenerationPlan } from '../extract/types.js';
import type { WorkspaceManifest } from '../extract/types.js';

/** Hoisted from upstream monorepo root for flat layout (stub / tsc). */
const STUB_ROOT_DEV_DEPENDENCIES = [
  'tsdown',
  '@tsdown/css',
  'typescript',
  '@types/node',
] as const;

/** App scripts use `pnpm vite` / `vue-tsc` — hoisted from upstream root in monorepo. */
const APP_ROOT_DEV_DEPENDENCIES = [
  'vite',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  'vue-tsc',
  'tailwindcss',
] as const;

export async function transformGeneratedPackageJsons(options: {
  plan: GenerationPlan;
  manifest: WorkspaceManifest;
  packageName: string;
}): Promise<void> {
  const rootPackageJsonPath = join(options.plan.targetDir, 'package.json');
  const rootPackageJson = JSON.parse(await readFile(rootPackageJsonPath, 'utf8')) as PackageJson;
  const upstreamRootPackageJson = JSON.parse(
    await readFile(join(options.plan.upstreamRoot, 'package.json'), 'utf8'),
  ) as PackageJson;

  const stubDevDependencies = pickResolvedDevDependencies(
    upstreamRootPackageJson.devDependencies,
    options.manifest.catalog,
    STUB_ROOT_DEV_DEPENDENCIES,
  );
  const appDevDependencies = pickResolvedDevDependencies(
    upstreamRootPackageJson.devDependencies,
    options.manifest.catalog,
    APP_ROOT_DEV_DEPENDENCIES,
  );

  const transformedRoot = transformPackageJson(rootPackageJson, options.manifest.catalog, {
    name: options.packageName,
    version: '0.0.0',
    private: true,
    packageManager: upstreamRootPackageJson.packageManager,
    engines: upstreamRootPackageJson.engines,
    scripts: upstreamRootPackageJson.scripts?.postinstall
      ? { postinstall: upstreamRootPackageJson.scripts.postinstall }
      : undefined,
    devDependencies: {
      ...rootPackageJson.devDependencies,
      ...stubDevDependencies,
      ...appDevDependencies,
      '@vben/vite-config': 'workspace:*',
      '@vben/tsconfig': 'workspace:*',
      '@vben/tailwind-config': 'workspace:*',
    },
  });

  await writeFile(rootPackageJsonPath, `${JSON.stringify(transformedRoot, null, 2)}\n`, 'utf8');

  for (const pkg of options.plan.closure.packages) {
    if (pkg.name === options.plan.templatePackageName) {
      continue;
    }

    const targetPath = join(options.plan.targetDir, pkg.relativeDir, 'package.json');
    const packageJson = JSON.parse(await readFile(targetPath, 'utf8')) as PackageJson;
    const transformed = transformPackageJson(packageJson, options.manifest.catalog);
    await writeFile(targetPath, `${JSON.stringify(transformed, null, 2)}\n`, 'utf8');
  }
}

export function transformPackageJson(
  packageJson: PackageJson,
  catalog: Record<string, string>,
  overrides: Partial<PackageJson> = {},
): PackageJson {
  const next: PackageJson = {
    ...packageJson,
    ...overrides,
    scripts: {
      ...packageJson.scripts,
      ...(overrides.scripts ?? {}),
    },
    dependencies: transformDependencyBlock(packageJson.dependencies, catalog),
    devDependencies: transformDependencyBlock(
      {
        ...packageJson.devDependencies,
        ...(overrides.devDependencies as Record<string, string> | undefined),
      },
      catalog,
    ),
    peerDependencies: transformDependencyBlock(packageJson.peerDependencies, catalog),
    optionalDependencies: transformDependencyBlock(packageJson.optionalDependencies, catalog),
  };

  return next;
}

function transformDependencyBlock(
  block: Record<string, string> | undefined,
  catalog: Record<string, string>,
): Record<string, string> | undefined {
  if (!block) {
    return undefined;
  }

  const next: Record<string, string> = {};
  for (const [name, spec] of Object.entries(block)) {
    next[name] = resolveDependencySpec(name, spec, catalog);
  }
  return next;
}

function pickResolvedDevDependencies(
  upstreamDevDependencies: Record<string, string> | undefined,
  catalog: Record<string, string>,
  names: readonly string[],
): Record<string, string> {
  if (!upstreamDevDependencies) {
    return {};
  }

  const picked: Record<string, string> = {};
  for (const name of names) {
    const spec = upstreamDevDependencies[name];
    if (!spec) {
      continue;
    }
    picked[name] = resolveDependencySpec(name, spec, catalog);
  }
  return picked;
}

function resolveDependencySpec(
  dependencyName: string,
  spec: string,
  catalog: Record<string, string>,
): string {
  if (spec === 'catalog:') {
    const version = catalog[dependencyName];
    if (!version) {
      throw new Error(`Missing catalog entry for dependency "${dependencyName}".`);
    }
    return version;
  }

  if (spec.startsWith('catalog:')) {
    const catalogKey = spec.slice('catalog:'.length);
    const version = catalog[catalogKey] ?? catalog[dependencyName];
    if (!version) {
      throw new Error(`Missing catalog entry for dependency "${dependencyName}" (${spec}).`);
    }
    return version;
  }

  return spec;
}

export async function ensureParentDirectories(filePath: string): Promise<void> {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(dirname(filePath), { recursive: true });
}
