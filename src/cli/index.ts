import { readFileSync } from 'node:fs';
import { Command } from 'commander';
import { cyan, dim } from 'kolorist';
import { getPackagePath } from '../core/package-root.js';
import { createProject } from '../generate/create-project.js';
import { resolveOptions } from './resolve-options.js';

const pkg = JSON.parse(readFileSync(getPackagePath('package.json'), 'utf8')) as {
  version: string;
};

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command()
    .name('create-vben')
    .description('Generate a standalone vben-admin project from upstream monorepo')
    .version(pkg.version)
    .argument(
      '[project-path]',
      'Target directory (absolute path, relative path, or name → ~/Downloads/<name>)',
    )
    .option(
      '-t, --template <name>',
      'UI template (web-antd | web-ele | web-naive | web-tdesign | web-antdv-next)',
    )
    .option(
      '-r, --ref <ref>',
      'Upstream git ref (tag / branch / commit); default: latest release tag',
    )
    .option('--mock', 'Include apps/backend-mock (Nitro mock server)')
    .option('--no-mock', 'Do not include backend-mock (default)')
    .option('--offline', 'Use cached upstream snapshot only')
    .option('--force', 'Overwrite non-empty target directory')
    .option('--dry-run', 'Resolve and print plan without writing files')
    .action(async (projectPath: string | undefined, flags) => {
      const options = await resolveOptions({
        projectPath,
        template: flags.template,
        ref: flags.ref,
        mock: flags.mock ?? false,
        noMock: flags.noMock ?? false,
        offline: flags.offline ?? false,
        force: flags.force ?? false,
        dryRun: flags.dryRun ?? false,
      });

      console.log(dim(`create-vben v${pkg.version}`));
      console.log(cyan('Resolved options:'), options);

      if (options.dryRun) {
        console.log(dim('Dry run — no files written.'));
      }

      await createProject(options);
    });

  await program.parseAsync(argv);
}
