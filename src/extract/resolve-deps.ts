import {
  VBEN_BACKEND_MOCK_PACKAGE,
  VBEN_BUILD_TOOL_PACKAGES,
  VBEN_OPT_IN_PACKAGE_NAMES,
  VBEN_TEMPLATE_PACKAGE_NAME,
  type VbenTemplateId,
} from '../core/constants.js';
import type { DependencyClosure, WorkspaceManifest, WorkspacePackage } from './types.js';

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
] as const;

export interface ResolveDependencyClosureOptions {
  includeMock?: boolean;
}

export function resolveDependencyClosure(
  manifest: WorkspaceManifest,
  templateId: VbenTemplateId,
  options: ResolveDependencyClosureOptions = {},
): DependencyClosure {
  const startName = VBEN_TEMPLATE_PACKAGE_NAME[templateId];
  const startPackage = manifest.packageByName.get(startName);

  if (!startPackage) {
    throw new Error(`Template package "${startName}" was not found in upstream workspace.`);
  }

  const packageNames = new Set<string>();
  const seeds = [startPackage.name, ...VBEN_BUILD_TOOL_PACKAGES];

  if (options.includeMock) {
    seeds.push(VBEN_BACKEND_MOCK_PACKAGE);
  }

  for (const seed of seeds) {
    collectWorkspaceDependencies(seed, manifest, packageNames);
  }

  if (!options.includeMock) {
    for (const excluded of VBEN_OPT_IN_PACKAGE_NAMES) {
      packageNames.delete(excluded);
    }
  }

  const packages = [...packageNames]
    .sort()
    .map((name) => manifest.packageByName.get(name))
    .filter((entry): entry is WorkspacePackage => Boolean(entry));

  if (packages.length !== packageNames.size) {
    const missing = [...packageNames].filter((name) => !manifest.packageByName.has(name));
    throw new Error(`Missing workspace packages in upstream snapshot: ${missing.join(', ')}`);
  }

  return { packageNames, packages };
}

function collectWorkspaceDependencies(
  packageName: string,
  manifest: WorkspaceManifest,
  visited: Set<string>,
): void {
  if (visited.has(packageName)) {
    return;
  }

  const pkg = manifest.packageByName.get(packageName);
  if (!pkg) {
    return;
  }

  visited.add(packageName);

  for (const field of DEPENDENCY_FIELDS) {
    const deps = pkg.packageJson[field];
    if (!deps) {
      continue;
    }

    for (const [depName, spec] of Object.entries(deps)) {
      if (isWorkspaceSpec(spec) && manifest.packageByName.has(depName)) {
        collectWorkspaceDependencies(depName, manifest, visited);
      }
    }
  }
}

function isWorkspaceSpec(spec: string): boolean {
  return spec === 'workspace:*' || spec.startsWith('workspace:');
}

export function getTemplatePackageName(templateId: VbenTemplateId): string {
  return VBEN_TEMPLATE_PACKAGE_NAME[templateId];
}
