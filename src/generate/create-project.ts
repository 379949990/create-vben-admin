import type { ResolvedCliOptions } from '../cli/resolve-options.js';

/**
 * Placeholder for the full generation pipeline.
 * CV1-07 will implement: fetch → parse → resolve deps → flatten → write.
 */
export async function createProject(options: ResolvedCliOptions): Promise<void> {
  throw new Error(
    [
      'Project generation is not implemented yet.',
      `Target: ${options.projectName}`,
      `Template: ${options.template}`,
      `Ref: ${options.ref}`,
      'See docs/versions/v1.0.0/dev-guide.md (CV1-07).',
    ].join('\n'),
  );
}
