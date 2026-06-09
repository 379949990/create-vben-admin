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
  defaultRef: 'main',
  githubUrl: 'https://github.com/vbenjs/vue-vben-admin',
  appsDir: 'apps',
  packagesDir: 'packages',
  internalDir: 'internal',
} as const;

export const CLI_CACHE_DIR = '.create-vben-cache';
