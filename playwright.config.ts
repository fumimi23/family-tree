import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const BASE_URL = `http://localhost:${PORT.toString()}`;

/*
 * E2E + VRT 設定。webServer は本番ビルドを preview で配信する (dev サーバより本番に近い)。
 * VRT の baseline はフォント差を避けるため公式 Playwright Docker イメージで生成・比較する
 * (CI / ローカルとも同イメージを使う前提)。
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI === undefined ? 0 : 2,
  reporter: process.env.CI === undefined
    ? 'list'
    : [['list'], ['html', { open: 'never' }]],
  // baseline は OS ごとに分けず、固定名で管理する (生成・比較を同一 Docker イメージに統一するため)
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  expect: {
    // アンチエイリアス由来の微差を許容する
    toHaveScreenshot: { maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  /*
   * 機能 E2E (e2e) と VRT (vrt) を project で分ける。
   * VRT はフォント差を避けるため公式 Docker イメージでのみ実行する想定なので、
   * `yarn e2e` (= --project=e2e) と `yarn vrt` (= --project=vrt) で呼び分ける。
   */
  projects: [
    {
      name: 'e2e',
      testIgnore: /visual\.spec\.ts$/u,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'vrt',
      testMatch: /visual\.spec\.ts$/u,
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
