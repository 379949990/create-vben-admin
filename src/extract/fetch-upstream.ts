import { createWriteStream } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import * as tar from 'tar';
import { getTarballUrl, getUpstreamCacheDir } from '../utils/paths.js';
import { pathExists } from '../utils/fs.js';
import { resolveUpstreamRef } from './resolve-ref.js';

export interface FetchUpstreamOptions {
  ref?: string;
  offline?: boolean;
}

export async function fetchUpstreamSnapshot(options: FetchUpstreamOptions): Promise<{
  rootDir: string;
  ref: string;
}> {
  const ref = await resolveUpstreamRef(options.ref);
  const cacheDir = getUpstreamCacheDir(ref);
  const marker = join(cacheDir, 'pnpm-workspace.yaml');

  if (await pathExists(marker)) {
    return { rootDir: cacheDir, ref };
  }

  if (options.offline) {
    throw new Error(
      `No cached upstream snapshot for ref "${ref}". Run without --offline once to populate ~/.create-vben-admin-cache/.`,
    );
  }

  await mkdir(cacheDir, { recursive: true });

  const tempDir = join(tmpdir(), `create-vben-admin-${Date.now()}`);
  const tarballPath = join(tempDir, 'upstream.tar.gz');

  await mkdir(tempDir, { recursive: true });

  try {
    await downloadTarball(ref, tarballPath);
    await extractTarball(tarballPath, tempDir);

    const extractedRoot = await findSingleRootDirectory(tempDir, ['upstream.tar.gz']);
    await copyDirectoryContents(extractedRoot, cacheDir);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }

  if (!(await pathExists(marker))) {
    throw new Error(
      `Upstream snapshot for ref "${ref}" is missing pnpm-workspace.yaml after extraction.`,
    );
  }

  return { rootDir: cacheDir, ref };
}

async function downloadTarball(ref: string, destination: string): Promise<void> {
  const url = getTarballUrl(ref);
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download upstream tarball (${response.status}) from ${url}`);
  }

  await pipeline(response.body as unknown as NodeJS.ReadableStream, createWriteStream(destination));
}

async function extractTarball(tarballPath: string, destination: string): Promise<void> {
  await tar.extract({
    file: tarballPath,
    cwd: destination,
  });
}

async function findSingleRootDirectory(baseDir: string, ignore: string[]): Promise<string> {
  const entries = await readdir(baseDir, { withFileTypes: true });
  const directories = entries.filter(
    (entry) => entry.isDirectory() && !ignore.includes(entry.name),
  );

  if (directories.length !== 1) {
    throw new Error(
      `Expected one extracted upstream directory in ${baseDir}, found ${directories.length}.`,
    );
  }

  return join(baseDir, directories[0]!.name);
}

async function copyDirectoryContents(sourceDir: string, targetDir: string): Promise<void> {
  const { cp } = await import('node:fs/promises');
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    await cp(join(sourceDir, entry.name), join(targetDir, entry.name), { recursive: true });
  }
}
