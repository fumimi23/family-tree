# 家系図作成ツール

日本語UIの家系図 (family tree) を作成・編集・閲覧するための Web アプリ。

## 主な機能

- 人物・関係 (実子 / 養子 / 夫婦 / 事実婚) の登録と編集
- 家系図の SVG 描画 (世代レイアウト / 兄弟順は生年月日順 / 養子は破線 / 故人は薄色)
- ズーム (ボタン + `Ctrl / Cmd + ホイール`)、横/縦スクロール、世代ラベル固定、ミニマップ
- ノードクリックで人物編集モーダル
- JSON 形式のインポート / エクスポート (D&D 対応)
- 家系図の画像エクスポート (SVG / PNG)
- ライト / ダークモード

## セットアップ

Node.js のバージョンは [`.node-version`](./.node-version) に固定。[nodenv](https://github.com/nodenv/nodenv) 等のバージョンマネージャ推奨。

パッケージマネージャは **Yarn** を使用 (`package.json` の `engines` で npm / pnpm の利用は想定外として明示。実行すると警告が出る)。Yarn は [Corepack](https://nodejs.org/api/corepack.html) 経由で自動取得される。

```bash
corepack enable          # 初回のみ
yarn install
yarn hooks:install       # 初回のみ。commit-msg フックを有効化
yarn dev
```

利用可能なスクリプトは `package.json` の `scripts` を参照 (`yarn dev` / `yarn build` / `yarn lint` / `yarn test` 等)。

### Git フック

`yarn hooks:install` を 1 度実行すると、`.githooks/commit-msg` がコミット時に commitlint を走らせ、`[#<issue>]<type>: <説明>` 形式から外れたメッセージを弾く。CI と同等の検証をローカルでも行えるので push 前のリトライを減らせる。

> [!NOTE]
> 仕組みは `git config core.hooksPath .githooks` (リポジトリローカル)。**この設定が有効な間は `.git/hooks/*` に置いた既存フックは実行されない**ので、すでに別のフックを使っている場合は注意。元に戻すには `git config --unset core.hooksPath` を実行する。

### E2E テスト (Playwright)

ページ全体の E2E テストは Playwright で実行する (`yarn e2e`)。

```bash
yarn playwright install chromium   # 初回のみ。ブラウザを取得
yarn e2e
```

> [!NOTE]
> `.yarnrc.yml` の `enableScripts: false` によりブラウザは `yarn install` 時に自動取得されないため、上記の `yarn playwright install` を手動で実行する。Linux でブラウザ起動に必要なシステムライブラリが足りない場合は `yarn playwright install --with-deps chromium` (要 sudo) を使う。

### VRT (ビジュアルリグレッションテスト)

家系図描画の見た目崩れは Playwright のスクリーンショット比較で検知する (`yarn vrt`)。フォント描画は OS / 環境で差が出るため、**baseline は公式 Playwright Docker イメージで生成・比較する** (CI もこのイメージで実行)。

baseline の更新は GitHub Actions の **VRT Update Baselines** ワークフロー (手動実行) で行う:

1. Actions タブから `VRT Update Baselines` を `workflow_dispatch` で実行
2. 生成された `vrt-baselines` artifact をダウンロード
3. `e2e/__screenshots__/` に展開して commit

> [!NOTE]
> 初回 baseline 投入が済むまで `vrt.yml` は `pull_request` トリガーのみ (main への `push` は付けていない)。baseline を commit したら `push: branches: [main]` を追加して main でも回す。

ローカルで生成・確認する場合は同じイメージを使う:

```bash
docker run --rm -v "$(pwd):/work" -w /work mcr.microsoft.com/playwright:v1.60.0-noble \
  sh -c "apt-get update && apt-get install -y fonts-noto-cjk && corepack enable && yarn install --immutable && yarn vrt --update-snapshots"
```

## ドキュメント

- [docs/family-tree.md](docs/family-tree.md) — 家系図の表記ルール
- [docs/family-tree-schema.md](docs/family-tree-schema.md) — データモデル仕様
- [CLAUDE.md](CLAUDE.md) — リポジトリの規約 / ワークフロー / 既知の落とし穴 (Claude 等の AI 用)

## サンプルデータ

[`sample/family-tree.json`](sample/family-tree.json) に動作確認用のサンプルが含まれる。画面上部の「インポート」ボタンから読み込むか、ファイルをページ上にドラッグ&ドロップ可能。
