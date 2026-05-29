/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    // vitest は src 配下のみ対象。Playwright の e2e/*.spec.ts は拾わない。
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
