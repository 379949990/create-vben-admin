/** Upstream vben-admin app templates we support extracting. */
export const VBEN_TEMPLATE_IDS = [
  'web-antd',
  'web-ele',
  'web-naive',
  'web-tdesign',
  'web-antdv-next',
] as const;

export type VbenTemplateId = (typeof VBEN_TEMPLATE_IDS)[number];

export function isVbenTemplateId(value: string): value is VbenTemplateId {
  return (VBEN_TEMPLATE_IDS as readonly string[]).includes(value);
}

/** Official upstream monorepo — single source of truth for extraction. */
export const VBEN_UPSTREAM = {
  owner: 'vbenjs',
  repo: 'vue-vben-admin',
  /** Resolved at runtime via GitHub releases/latest (Q2). */
  defaultRef: 'latest-release',
  githubUrl: 'https://github.com/vbenjs/vue-vben-admin',
  appsDir: 'apps',
  packagesDir: 'packages',
  internalDir: 'internal',
} as const;

export const VBEN_TEMPLATE_PACKAGE_NAME: Record<VbenTemplateId, string> = {
  'web-antd': '@vben/web-antd',
  'web-ele': '@vben/web-ele',
  'web-naive': '@vben/web-naive',
  'web-tdesign': '@vben/web-tdesign',
  'web-antdv-next': '@vben/web-antdv-next',
};

/** Always copied for build tooling even if not listed in app deps. */
export const VBEN_BUILD_TOOL_PACKAGES = [
  '@vben/vite-config',
  '@vben/tsconfig',
  '@vben/tailwind-config',
] as const;

/** Optional Nitro mock workspace app (user choice at generate time). */
export const VBEN_BACKEND_MOCK_PACKAGE = '@vben/backend-mock';

/** Excluded unless user opts in via --mock / interactive prompt. */
export const VBEN_OPT_IN_PACKAGE_NAMES = [VBEN_BACKEND_MOCK_PACKAGE] as const;

export const CLI_CACHE_DIR = '.create-vben-cache';
