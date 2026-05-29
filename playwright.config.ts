import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT.toString()}`;

/*
 * E2E 設定。VRT (スクリーンショット比較) は baseline 戦略の検討が必要なため #154 で別途対応。
 * webServer は本番ビルドを preview で配信する (dev サーバより挙動が本番に近い)。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI === undefined ? 0 : 2,
  reporter: process.env.CI === undefined
    ? 'list'
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'yarn build && yarn preview --port 4173 --strictPort',
    url: BASE_URL,
    reuseExistingServer: process.env.CI === undefined,
    timeout: 120_000,
  },
});
