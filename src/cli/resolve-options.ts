import * as p from '@clack/prompts';
import { isCancel } from '@clack/prompts';
import { VbenTemplateId, isVbenTemplateId } from '../core/constants.js';

export interface CliFlags {
  projectName?: string;
  template?: string;
  ref: string;
  offline: boolean;
  force: boolean;
  dryRun: boolean;
}

export interface ResolvedCliOptions {
  projectName: string;
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

  let projectName = flags.projectName;
  if (!projectName) {
    const input = await p.text({
      message: 'Project name',
      placeholder: 'my-vben-app',
      validate: (value) => (value?.trim() ? undefined : 'Project name is required'),
    });
    if (isCancel(input)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }
    projectName = input;
  }

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

  return {
    projectName: projectName.trim(),
    template,
    ref: flags.ref,
    offline: flags.offline,
    force: flags.force,
    dryRun: flags.dryRun,
  };
}
