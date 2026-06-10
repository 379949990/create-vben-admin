import { globby } from 'globby';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

const HTTP_METHODS = ['get', 'post', 'put', 'delete', 'patch'] as const;

export async function writeMockOpenApiFromUpstream(options: {
  upstreamRoot: string;
  targetDir: string;
}): Promise<string | undefined> {
  const mockApiDir = join(options.upstreamRoot, 'apps/backend-mock/api');
  const routeFiles = await globby('**/*.{ts,js}', {
    cwd: mockApiDir,
    onlyFiles: true,
  });

  if (routeFiles.length === 0) {
    return undefined;
  }

  const paths: Record<string, Record<string, unknown>> = {};

  for (const file of routeFiles.sort()) {
    const { method, path } = filePathToRoute(file);
    const methodKey = method.toLowerCase();
    paths[path] ??= {};
    paths[path][methodKey] = {
      summary: basename(file, '.ts'),
      responses: {
        '200': {
          description: 'Mock response (see upstream @vben/backend-mock handlers)',
        },
      },
    };
  }

  const document = {
    openapi: '3.0.3',
    info: {
      title: 'Vben Admin Mock API (reference)',
      description:
        'Route inventory extracted from upstream apps/backend-mock. Import into Apifox, Postman, or similar tools.',
      version: '1.0.0',
    },
    servers: [{ url: 'http://localhost:5320', description: 'Nitro mock (upstream default)' }],
    paths,
  };

  const outputPath = join(options.targetDir, 'docs/mock-api.openapi.json');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(document, null, 2)}\n`, 'utf8');
  return outputPath;
}

export function filePathToRoute(relativeFile: string): { method: string; path: string } {
  let method = 'get';
  let route = relativeFile.replace(/\.(ts|js)$/, '');

  for (const httpMethod of HTTP_METHODS) {
    if (route.endsWith(`.${httpMethod}`)) {
      method = httpMethod;
      route = route.slice(0, -(httpMethod.length + 1));
      break;
    }
  }

  route = route.replace(/\\/g, '/').replace(/\/\.[^/]+$/u, '');
  route = route.replace(/\[(\w+)]/g, '{$1}');

  return {
    method: method.toUpperCase(),
    path: `/api/${route}`.replace(/\/+/g, '/'),
  };
}

export async function patchDevelopmentEnv(options: {
  targetDir: string;
  includeMock: boolean;
}): Promise<void> {
  const envPath = join(options.targetDir, '.env.development');
  let content: string;

  try {
    content = await readFile(envPath, 'utf8');
  } catch {
    content = [
      'VITE_PORT=5888',
      'VITE_BASE=/',
      'VITE_GLOB_API_URL=/api',
      `VITE_NITRO_MOCK=${options.includeMock ? 'true' : 'false'}`,
      '',
    ].join('\n');
    await writeFile(envPath, content, 'utf8');
    return;
  }

  const nextValue = options.includeMock ? 'true' : 'false';
  if (/^VITE_NITRO_MOCK=.*$/m.test(content)) {
    content = content.replace(/^VITE_NITRO_MOCK=.*$/m, `VITE_NITRO_MOCK=${nextValue}`);
  } else {
    content = `${content.trimEnd()}\nVITE_NITRO_MOCK=${nextValue}\n`;
  }

  await writeFile(envPath, content, 'utf8');
}

export async function readDevelopmentPort(targetDir: string): Promise<string | undefined> {
  try {
    const content = await readFile(join(targetDir, '.env.development'), 'utf8');
    const match = content.match(/^VITE_PORT=(.+)$/m);
    return match?.[1]?.trim();
  } catch {
    return undefined;
  }
}

/** Copy remove-mock script into the generated project. */
export async function writeRemoveMockScript(options: {
  templatesDir: string;
  targetDir: string;
}): Promise<void> {
  const source = join(options.templatesDir, 'generated/scripts/remove-mock.mjs');
  const destination = join(options.targetDir, 'scripts/remove-mock.mjs');
  const script = await readFile(source, 'utf8');
  const { mkdir } = await import('node:fs/promises');
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, script, 'utf8');
}
