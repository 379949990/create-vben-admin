/** Placeholder — CV1-04: parse pnpm-workspace.yaml + package.json workspace graph. */
export interface WorkspaceManifest {
  rootDir: string;
  apps: string[];
  packages: string[];
}

export async function parseWorkspaceManifest(rootDir: string): Promise<WorkspaceManifest> {
  throw new Error(`Not implemented — see CV1-04 in dev-guide (root: ${rootDir})`);
}
