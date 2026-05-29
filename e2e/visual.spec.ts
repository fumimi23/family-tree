import { expect, type Page, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const SAMPLE_PATH = fileURLToPath(new URL('../sample/family-tree.json', import.meta.url));

/*
 * VRT (visual regression test)。サンプル JSON は固定なので描画は決定論的。
 * baseline は CI (公式 Playwright Docker イメージ) で生成し、同イメージで比較する。
 */

async function importSampleAndWait(page: Page): Promise<void> {
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PATH);
  // 家系図ノードが描画されるまで待つ
  await expect(page.getByRole('button', { name: '山田 太郎' })).toBeVisible();
  // フォント読み込み完了を待つ (未完了で撮ると text のメトリクスが変わり差分が出る)
  await page.evaluate(async() => {
    await document.fonts.ready;
  });
}

test('家系図 (ライトモード) の見た目', async({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'light');
  });
  await page.goto('/');
  await importSampleAndWait(page);
  await expect(page).toHaveScreenshot('family-tree-light.png', {
    fullPage: true,
  });
});

test('家系図 (ダークモード) の見た目', async({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('theme', 'dark');
  });
  await page.goto('/');
  await importSampleAndWait(page);
  await expect(page).toHaveScreenshot('family-tree-dark.png', {
    fullPage: true,
  });
});
