import { readFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { globby } from 'globby';
import type { PackageJson, WorkspaceManifest, WorkspacePackage } from './types.js';

const PACKAGE_JSON = 'package.json';
const WORKSPACE_SCAN_DIRS = ['apps', 'packages', 'internal', 'scripts'];

export async function parseWorkspaceManifest(rootDir: string): Promise<WorkspaceManifest> {
  const workspaceYamlPath = join(rootDir, 'pnpm-workspace.yaml');
  const workspaceYaml = await readFile(workspaceYamlPath, 'utf8');
  const { catalog } = parsePnpmWorkspaceYaml(workspaceYaml);

  const packageJsonPaths = await globby(
    WORKSPACE_SCAN_DIRS.map((dir) => `${dir}/**/${PACKAGE_JSON}`),
    {
      cwd: rootDir,
      onlyFiles: true,
      gitignore: true,
      ignore: ['**/node_modules/**'],
    },
  );

  const packages: WorkspacePackage[] = [];
  const packageByName = new Map<string, WorkspacePackage>();

  for (const relativePath of packageJsonPaths.sort()) {
    const absolutePath = join(rootDir, relativePath);
    const dir = join(rootDir, dirname(relativePath));
    const packageJson = JSON.parse(await readFile(absolutePath, 'utf8')) as PackageJson;

    if (!packageJson.name) {
      continue;
    }

    const entry: WorkspacePackage = {
      name: packageJson.name,
      dir,
      relativeDir: relative(rootDir, dir),
      packageJson,
    };

    packages.push(entry);
    packageByName.set(entry.name, entry);
  }

  return {
    rootDir,
    packages,
    packageByName,
    workspaceYaml,
    catalog,
  };
}

function parsePnpmWorkspaceYaml(content: string): {
  packages: string[];
  catalog: Record<string, string>;
} {
  const packages: string[] = [];
  const catalog: Record<string, string> = {};
  let section: 'none' | 'packages' | 'catalog' = 'none';

  for (const line of content.split('\n')) {
    if (/^packages:\s*$/.test(line)) {
      section = 'packages';
      continue;
    }
    if (/^catalog:\s*$/.test(line)) {
      section = 'catalog';
      continue;
    }
    if (/^[A-Za-z@]/.test(line) && !line.startsWith(' ')) {
      section = 'none';
      continue;
    }

    if (section === 'packages') {
      const match = line.match(/^\s+-\s+(.+)$/);
      if (match) {
        packages.push(match[1]!.trim());
      }
      continue;
    }

    if (section === 'catalog') {
      const match = line.match(/^\s+['"]?([^'":\s]+)['"]?\s*:\s*(.+)$/);
      if (match) {
        catalog[match[1]!] = match[2]!.trim();
      }
    }
  }

  return { packages, catalog };
}

export { parsePnpmWorkspaceYaml };
