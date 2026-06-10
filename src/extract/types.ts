export interface PackageJson {
  name?: string;
  version?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface WorkspacePackage {
  name: string;
  dir: string;
  relativeDir: string;
  packageJson: PackageJson;
}

export interface WorkspaceManifest {
  rootDir: string;
  packages: WorkspacePackage[];
  packageByName: Map<string, WorkspacePackage>;
  workspaceYaml: string;
  catalog: Record<string, string>;
}

export interface DependencyClosure {
  packageNames: Set<string>;
  packages: WorkspacePackage[];
}

export interface FileCopyEntry {
  sourcePath: string;
  targetPath: string;
}

export interface GenerationPlan {
  upstreamRoot: string;
  targetDir: string;
  templateId: string;
  templatePackageName: string;
  ref: string;
  includeMock: boolean;
  files: FileCopyEntry[];
  closure: DependencyClosure;
}
