import type { DependencyClosure, PackageJson, WorkspacePackage } from '../extract/types.js';

const BUILD_SCRIPT_KEYS = ['stub', 'build', 'prebuild'] as const;

/** When any workspace package stubs/builds, these are resolved from upstream root if present. */
const STUB_BASELINE_TOOLS = ['tsdown', '@tsdown/css', 'typescript', '@types/node'] as const;

/** Flat app scripts (`pnpm vite`, `vue-tsc`) — resolved from upstream root when listed there. */
const FLAT_APP_TOOL_CANDIDATES = [
  'vite',
  '@vitejs/plugin-vue',
  '@vitejs/plugin-vue-jsx',
  'vue-tsc',
  'tailwindcss',
] as const;

const SCRIPT_TOOL_ALIASES: Record<string, readonly string[]> = {
  tsc: ['typescript', '@types/node'],
  tsdown: ['tsdown', '@tsdown/css'],
  vite: ['vite'],
  'vue-tsc': ['vue-tsc'],
};

export function deriveHoistedRootDevDependencyNames(
  closure: DependencyClosure,
  templatePackage: WorkspacePackage,
): Set<string> {
  const names = new Set<string>();

  for (const pkg of closure.packages) {
    collectFromPackage(pkg, names);
  }

  collectFromScripts(templatePackage.packageJson.scripts, names);

  if (names.has('typescript')) {
    names.add('@types/node');
  }

  return names;
}

export function pickHoistedRootDevDependencies(options: {
  closure: DependencyClosure;
  templatePackage: WorkspacePackage;
  upstreamRootDevDependencies: Record<string, string> | undefined;
  catalog: Record<string, string>;
  resolveSpec: (dependencyName: string, spec: string) => string;
}): Record<string, string> {
  const wanted = deriveHoistedRootDevDependencyNames(options.closure, options.templatePackage);

  for (const name of FLAT_APP_TOOL_CANDIDATES) {
    if (options.upstreamRootDevDependencies?.[name]) {
      wanted.add(name);
    }
  }

  const picked: Record<string, string> = {};
  const upstream = options.upstreamRootDevDependencies ?? {};

  for (const name of [...wanted].sort()) {
    const spec = upstream[name];
    if (!spec || isWorkspaceSpec(spec)) {
      continue;
    }
    picked[name] = options.resolveSpec(name, spec);
  }

  return picked;
}

function collectFromPackage(pkg: WorkspacePackage, names: Set<string>): void {
  collectFromScripts(pkg.packageJson.scripts, names);
  collectExternalDependencyNames(pkg.packageJson.devDependencies, names);

  if (hasBuildLifecycleScript(pkg.packageJson.scripts)) {
    for (const tool of STUB_BASELINE_TOOLS) {
      names.add(tool);
    }
  }
}

function collectFromScripts(scripts: PackageJson['scripts'], names: Set<string>): void {
  if (!scripts) {
    return;
  }

  for (const key of BUILD_SCRIPT_KEYS) {
    const script = scripts[key];
    if (script) {
      extractToolNamesFromScript(script, names);
    }
  }

  for (const script of Object.values(scripts)) {
    extractToolNamesFromScript(script, names);
  }
}

function hasBuildLifecycleScript(scripts: PackageJson['scripts']): boolean {
  if (!scripts) {
    return false;
  }

  return BUILD_SCRIPT_KEYS.some((key) => Boolean(scripts[key]));
}

function extractToolNamesFromScript(script: string, names: Set<string>): void {
  for (const match of script.matchAll(/\bpnpm exec ([@\w/-]+)/g)) {
    addToolWithAliases(match[1]!, names);
  }

  for (const [alias, packages] of Object.entries(SCRIPT_TOOL_ALIASES)) {
    if (new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(script)) {
      for (const pkg of packages) {
        names.add(pkg);
      }
    }
  }
}

function collectExternalDependencyNames(
  dependencies: Record<string, string> | undefined,
  names: Set<string>,
): void {
  if (!dependencies) {
    return;
  }

  for (const [name, spec] of Object.entries(dependencies)) {
    if (!isWorkspaceSpec(spec)) {
      names.add(name);
    }
  }
}

function addToolWithAliases(toolName: string, names: Set<string>): void {
  names.add(toolName);
  const aliases = SCRIPT_TOOL_ALIASES[toolName];
  if (aliases) {
    for (const pkg of aliases) {
      names.add(pkg);
    }
  }
}

function isWorkspaceSpec(spec: string): boolean {
  return spec === 'workspace:*' || spec.startsWith('workspace:');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
