import { homedir } from 'node:os';
import { join } from 'node:path';
import { CLI_CACHE_DIR, VBEN_UPSTREAM } from '../core/constants.js';

export function getCacheRoot(): string {
  return process.env.CREATE_VBEN_CACHE ?? join(homedir(), CLI_CACHE_DIR);
}

export function getUpstreamCacheDir(ref: string): string {
  const safeRef = ref.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return join(getCacheRoot(), VBEN_UPSTREAM.owner, VBEN_UPSTREAM.repo, safeRef);
}

export function sanitizeRefForTarball(ref: string): string {
  return ref.replace(/^refs\/tags\//, '').replace(/^refs\/heads\//, '');
}

export function getTarballUrl(ref: string): string {
  const normalized = sanitizeRefForTarball(ref);
  return `https://codeload.github.com/${VBEN_UPSTREAM.owner}/${VBEN_UPSTREAM.repo}/tar.gz/${encodeURIComponent(normalized)}`;
}
