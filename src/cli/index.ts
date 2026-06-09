import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';
import { cyan, dim } from 'kolorist';
import { createProject } from '../generate/create-project.js';
import { resolveOptions } from './resolve-options.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8')) as {
  version: string;
};

export async function runCli(argv: string[]): Promise<void> {
  const program = new Command()
    .name('create-vben')
    .description('Generate a standalone vben-admin project from upstream monorepo')
    .version(pkg.version)
    .argument('[project-name]', 'Target directory name')
    .option(
      '-t, --template <name>',
      'UI template (web-antd | web-ele | web-naive | web-tdesign | web-antdv-next)',
    )
    .option('-r, --ref <ref>', 'Upstream git ref (tag / branch / commit)', 'main')
    .option('--offline', 'Use cached upstream snapshot only')
    .option('--force', 'Overwrite non-empty target directory')
    .option('--dry-run', 'Resolve and print plan without writing files')
    .action(async (projectName: string | undefined, flags) => {
      const options = await resolveOptions({
        projectName,
        template: flags.template,
        ref: flags.ref,
        offline: flags.offline ?? false,
        force: flags.force ?? false,
        dryRun: flags.dryRun ?? false,
      });

      console.log(dim(`create-vben v${pkg.version}`));
      console.log(cyan('Resolved options:'), options);

      if (options.dryRun) {
        console.log(dim('Dry run — no files written.'));
        return;
      }

      await createProject(options);
    });

  await program.parseAsync(argv);
}
