import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: src },
      { find: /^next\/link$/, replacement: `${src}/compat/next-link.tsx` },
      { find: /^next\/navigation$/, replacement: `${src}/compat/next-navigation.ts` },
    ],
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
  },
});
