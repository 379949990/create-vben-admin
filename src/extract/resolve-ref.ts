import { VBEN_UPSTREAM } from '../core/constants.js';

const LATEST_RELEASE_URL = `https://api.github.com/repos/${VBEN_UPSTREAM.owner}/${VBEN_UPSTREAM.repo}/releases/latest`;

let cachedLatestReleaseTag: string | undefined;

/** Default upstream ref: latest GitHub release tag (Q2). */
export async function resolveDefaultUpstreamRef(): Promise<string> {
  return resolveLatestReleaseTag();
}

export async function resolveLatestReleaseTag(): Promise<string> {
  if (cachedLatestReleaseTag) {
    return cachedLatestReleaseTag;
  }

  const response = await fetch(LATEST_RELEASE_URL, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to resolve latest upstream release (${response.status}). Pass --ref explicitly or try again later.`,
    );
  }

  const payload = (await response.json()) as { tag_name?: string };
  if (!payload.tag_name) {
    throw new Error('Latest upstream release response did not include tag_name.');
  }

  cachedLatestReleaseTag = payload.tag_name;
  return payload.tag_name;
}

/** Resolve user ref or fall back to latest release tag. */
export async function resolveUpstreamRef(ref: string | undefined): Promise<string> {
  if (ref && ref.trim()) {
    return ref.trim();
  }
  return resolveDefaultUpstreamRef();
}
