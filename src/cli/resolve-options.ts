import * as p from '@clack/prompts';
import { isCancel } from '@clack/prompts';
import { VbenTemplateId, isVbenTemplateId } from '../core/constants.js';
import { resolveUpstreamRef } from '../extract/resolve-ref.js';
import { getDefaultProjectTargetPath, resolveProjectTarget } from '../utils/project-path.js';

export interface CliFlags {
  projectPath?: string;
  template?: string;
  ref?: string;
  offline: boolean;
  force: boolean;
  dryRun: boolean;
}

export interface ResolvedCliOptions {
  targetDir: string;
  packageName: string;
  template: VbenTemplateId;
  ref: string;
  offline: boolean;
  force: boolean;
  dryRun: boolean;
}

const TEMPLATE_CHOICES = [
  { value: 'web-antd' as const, label: 'Ant Design Vue', hint: 'apps/web-antd' },
  { value: 'web-ele' as const, label: 'Element Plus', hint: 'apps/web-ele' },
  { value: 'web-naive' as const, label: 'Naive UI', hint: 'apps/web-naive' },
  { value: 'web-tdesign' as const, label: 'TDesign', hint: 'apps/web-tdesign' },
  { value: 'web-antdv-next' as const, label: 'Ant Design Vue Next', hint: 'apps/web-antdv-next' },
];

export async function resolveOptions(flags: CliFlags): Promise<ResolvedCliOptions> {
  p.intro('create-vben');

  let projectPath = flags.projectPath;
  if (!projectPath) {
    const defaultPath = getDefaultProjectTargetPath();
    const input = await p.text({
      message: 'Project path',
      placeholder: defaultPath,
      initialValue: defaultPath,
      validate: (value) => (value?.trim() ? undefined : 'Project path is required'),
    });
    if (isCancel(input)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    projectPath = input;
  }

  const { targetDir, packageName } = resolveProjectTarget(projectPath);

  let template: VbenTemplateId;
  if (flags.template) {
    if (!isVbenTemplateId(flags.template)) {
      throw new Error(
        `Unknown template "${flags.template}". Use one of: ${TEMPLATE_CHOICES.map((t) => t.value).join(', ')}`,
      );
    }
    template = flags.template;
  } else {
    const selected = await p.select({
      message: 'Pick a UI template',
      options: TEMPLATE_CHOICES,
    });
    if (isCancel(selected)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    template = selected;
  }

  p.outro('Ready to generate');

  const ref = await resolveUpstreamRef(flags.ref);

  return {
    targetDir,
    packageName,
    template,
    ref,
    offline: flags.offline,
    force: flags.force,
    dryRun: flags.dryRun,
  };
}
