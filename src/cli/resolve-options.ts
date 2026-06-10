import * as p from '@clack/prompts';
import { isCancel } from '@clack/prompts';
import { VbenTemplateId, isVbenTemplateId } from '../core/constants.js';
import { resolveUpstreamRef } from '../extract/resolve-ref.js';
import { directoryIsEmpty } from '../utils/fs.js';
import { getDefaultProjectTargetPath, resolveProjectTarget } from '../utils/project-path.js';

export interface CliFlags {
  projectPath?: string;
  template?: string;
  ref?: string;
  mock?: boolean;
  noMock?: boolean;
  offline: boolean;
  force: boolean;
  dryRun: boolean;
}

export interface ResolvedCliOptions {
  targetDir: string;
  packageName: string;
  template: VbenTemplateId;
  ref: string;
  includeMock: boolean;
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
  const force = await resolveForce(flags, targetDir);

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

  const includeMock = await resolveIncludeMock(flags);

  p.outro('Ready to generate');

  const ref = await resolveUpstreamRef(flags.ref);

  return {
    targetDir,
    packageName,
    template,
    ref,
    includeMock,
    offline: flags.offline,
    force,
    dryRun: flags.dryRun,
  };
}

async function resolveForce(flags: CliFlags, targetDir: string): Promise<boolean> {
  if (flags.force || flags.dryRun) {
    return flags.force;
  }

  if (await directoryIsEmpty(targetDir)) {
    return false;
  }

  if (!process.stdin.isTTY) {
    return false;
  }

  const selected = await p.confirm({
    message: `Directory "${targetDir}" is not empty. Overwrite existing files?`,
    initialValue: false,
  });

  if (isCancel(selected)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  if (!selected) {
    p.cancel('Target directory is not empty. Use --force or choose another path.');
    process.exit(0);
  }

  return true;
}

async function resolveIncludeMock(flags: CliFlags): Promise<boolean> {
  if (flags.mock && flags.noMock) {
    throw new Error('Use either --mock or --no-mock, not both.');
  }

  if (flags.mock) {
    return true;
  }

  if (flags.noMock) {
    return false;
  }

  const selected = await p.confirm({
    message: 'Include Nitro mock server (apps/backend-mock)?',
    initialValue: false,
  });

  if (isCancel(selected)) {
    p.cancel('Operation cancelled.');
    process.exit(0);
  }

  return selected;
}
