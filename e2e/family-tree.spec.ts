import { expect, test } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const SAMPLE_PATH = fileURLToPath(new URL('../sample/family-tree.json', import.meta.url));

test.beforeEach(async({ page }) => {
  await page.goto('/');
});

test('初期状態では家系図に案内メッセージが出る', async({ page }) => {
  await expect(page.getByText('人物を追加すると家系図が表示されます。')).toBeVisible();
});

test('サンプル JSON をインポートすると家系図が描画される', async({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PATH);
  // 家系図 SVG に主要人物のノードが出る
  await expect(page.getByRole('button', { name: '山田 太郎' })).toBeVisible();
  await expect(page.getByText('人物を追加すると家系図が表示されます。')).toBeHidden();
});

test('人物を追加すると人物一覧と家系図に反映される', async({ page }) => {
  await page.getByRole('button', { name: '人物追加' }).click();
  // ダイアログのフォーム入力 (姓 / 名 が必須)
  await page.getByPlaceholder('姓', { exact: true }).fill('テスト');
  await page.getByPlaceholder('名', { exact: true }).fill('太郎');
  await page.getByPlaceholder('姓（カナ）').fill('テスト');
  await page.getByPlaceholder('名（カナ）').fill('タロウ');
  await page.getByRole('button', { name: '保存' }).click();
  // 家系図ノードとして描画される
  await expect(page.getByRole('button', { name: 'テスト 太郎' })).toBeVisible();
});

test('エクスポートリンクが download 属性付きで存在する', async({ page }) => {
  const exportLink = page.getByRole('link', { name: 'エクスポート' });
  await expect(exportLink).toHaveAttribute('download', 'family-tree.json');
});

test('インポート後にノードをクリックすると編集ダイアログが開く', async({ page }) => {
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_PATH);
  await page.getByRole('button', { name: '山田 太郎' }).click();
  await expect(page.getByText('人物編集')).toBeVisible();
  await expect(page.getByPlaceholder('姓', { exact: true })).toHaveValue('山田');
});

test('関係追加で夫婦を選ぶと「家系を継ぐ側」が表示される', async({ page }) => {
  await page.getByRole('button', { name: '関係追加' }).click();
  const dialog = page.getByRole('dialog');
  // 婚姻関係を選ぶ前は非表示
  await expect(dialog.getByText('家系を継ぐ側 (任意)')).toBeHidden();
  // 関係セレクトを開いて「夫婦」を選択
  const relationTrigger = dialog.locator('[data-part="trigger"]').first();
  await relationTrigger.click();
  await page.getByRole('option', { name: '夫婦' }).click();
  // 婚姻なので「家系を継ぐ側」のラジオが出る
  await expect(dialog.getByText('家系を継ぐ側 (任意)')).toBeVisible();
  await expect(dialog.getByText('夫側')).toBeVisible();
  await expect(dialog.getByText('妻側')).toBeVisible();
});
