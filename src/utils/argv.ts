/** Normalize process.argv / pnpm `--` forwarding for commander. */
export function normalizeCliArgv(argv: string[]): string[] {
  const args = argv.slice(2);
  const separatorIndex = args.indexOf('--');

  if (separatorIndex >= 0) {
    return ['node', 'create-vben', ...args.slice(separatorIndex + 1)];
  }

  return argv;
}
