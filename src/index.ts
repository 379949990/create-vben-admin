#!/usr/bin/env node

import { runCli } from './cli/index.js';

runCli(process.argv).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
