# 家系図作成ツール

日本語UIの家系図 (family tree) を作成・編集・閲覧するための Web アプリ。
React 19 + Vite + Chakra UI v3 + Zustand + Zod 製。

## 主な機能

- 人物・関係 (実子 / 養子 / 夫婦 / 事実婚) の登録と編集
- 家系図の SVG 描画 (世代レイアウト / 兄弟順は生年月日順 / 養子は破線 / 故人は薄色)
- ズーム (ボタン + `Ctrl + ホイール`)、横/縦スクロール、世代ラベル固定、ミニマップ
- ノードクリックで人物編集モーダル
- JSON 形式のインポート / エクスポート (D&D 対応)
- 家系図の画像エクスポート (SVG / PNG)
- ライト / ダークモード

## セットアップ

[Node.js](https://nodejs.org/) `^20.19.0 || >=22.12.0` が必要。バージョン管理には [nodenv](https://github.com/nodenv/nodenv) 等を推奨 (`.node-version` に明記)。

パッケージマネージャは **Yarn 4** 固定 (`package.json` の `engines` で npm / pnpm を禁止)。Yarn は [Corepack](https://nodejs.org/api/corepack.html) 経由で自動取得される。

```bash
# 初回のみ Corepack を有効化
corepack enable

# 依存をインストール
yarn install

# 開発サーバ
yarn dev
```

## スクリプト

| コマンド | 用途 |
| --- | --- |
| `yarn dev` | 開発サーバ起動 (Vite) |
| `yarn build` | 本番ビルド |
| `yarn preview` | ビルド成果物のプレビュー |
| `yarn lint` | ESLint チェック |
| `yarn format` | ESLint --fix |
| `yarn test` | Vitest (テスト 1 回実行) |
| `yarn test:watch` | Vitest ウォッチモード |

## ディレクトリ構成

```
src/
├── App.tsx                 アプリのルート (テーブル + 家系図)
├── components/
│   ├── familyTree/         家系図表示 (SVG + ズーム + ミニマップ)
│   │   ├── layoutFamilyTree.ts  純粋関数のレイアウト計算 エントリ
│   │   └── layout/         レイアウト計算の分割モジュール
│   ├── person/             人物テーブル / 追加・編集ダイアログ
│   ├── relation/           関係テーブル / 追加ダイアログ
│   └── ui/                 共通 UI (H1 / H2 / PrimaryButton / Toaster …)
├── schemas/                Zod スキーマ (Person / Relation / インポートJSON)
└── store/                  Zustand ストア (人物 / 関係)
sample/                     動作確認用サンプル JSON
docs/                       仕様ドキュメント
```

## ドキュメント

- [docs/family-tree.md](docs/family-tree.md) — 表記ルール (夫婦は二重線、養子は破線 等)
- [docs/family-tree-schema.md](docs/family-tree-schema.md) — データモデル仕様
- [CLAUDE.md](CLAUDE.md) — リポジトリの規約 / ワークフロー / 既知の落とし穴 (Claude 等の AI 用)

## サンプルデータ

`sample/family-tree.json` に 4 世代 31 名の動作確認用サンプルが含まれる。
画面上部の「インポート」ボタンから読み込むか、ファイルをページ上にドラッグ&ドロップ可能。
