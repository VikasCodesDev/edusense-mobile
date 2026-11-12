import { afterEach, expect, test, vi } from 'vitest';
import { getApiConfiguration } from './apiConfig';

afterEach(() => {
  vi.unstubAllGlobals();
});

test('uses the verified production backend by default', async () => {
  vi.stubGlobal('window', {
    localStorage: {
      getItem: vi.fn(() => null),
    },
  });

  await expect(getApiConfiguration()).resolves.toEqual({
    url: 'https://edusense-backend-1h2q.onrender.com/api',
    source: 'build',
  });
});
