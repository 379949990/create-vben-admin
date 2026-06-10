import { describe, expect, it } from 'vitest';
import { filePathToRoute } from '../src/generate/project-extras.js';

describe('filePathToRoute', () => {
  it('maps Nitro file routes to OpenAPI paths', () => {
    expect(filePathToRoute('auth/login.post.ts')).toEqual({
      method: 'POST',
      path: '/api/auth/login',
    });
  });

  it('handles dynamic segments', () => {
    expect(filePathToRoute('user/[id].get.ts')).toEqual({
      method: 'GET',
      path: '/api/user/{id}',
    });
  });

  it('defaults to GET when no method suffix', () => {
    expect(filePathToRoute('menu/list.ts')).toEqual({
      method: 'GET',
      path: '/api/menu/list',
    });
  });
});
