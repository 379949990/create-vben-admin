#!/usr/bin/env node

import { runCli } from './cli/index.js';
import { normalizeCliArgv } from './utils/argv.js';

runCli(normalizeCliArgv(process.argv)).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
