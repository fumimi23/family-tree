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

パッケージマネージャは **Yarn** 固定 (`package.json` の `engines` で npm / pnpm を禁止)。Yarn は [Corepack](https://nodejs.org/api/corepack.html) 経由で自動取得される。

```bash
corepack enable          # 初回のみ
yarn install
yarn dev
```

利用可能なスクリプトは `package.json` の `scripts` を参照 (`yarn dev` / `yarn build` / `yarn lint` / `yarn test` 等)。

## ドキュメント

- [docs/family-tree.md](docs/family-tree.md) — 家系図の表記ルール
- [docs/family-tree-schema.md](docs/family-tree-schema.md) — データモデル仕様
- [CLAUDE.md](CLAUDE.md) — リポジトリの規約 / ワークフロー / 既知の落とし穴 (Claude 等の AI 用)

## サンプルデータ

[`sample/family-tree.json`](sample/family-tree.json) に動作確認用のサンプルが含まれる。画面上部の「インポート」ボタンから読み込むか、ファイルをページ上にドラッグ&ドロップ可能。
