# CLAUDE.md

このリポジトリで Claude が作業するときの、コードから派生できない規約と既知の落とし穴。

## このファイルの更新方針

イベント駆動で更新する:

- **新しい規約が出てきた時** — ユーザーから「これからは X で」と言われたら、その場で追記
- **同じ落とし穴を 2 回以上踏んだ時** — 1 回目は記録しない。2 回目で「これは記録すべき」と判断して追記
- **既存の記述が陳腐化した時** — コードベースの変更で前提が変わったら削除/修正

定期見直しや全 PR での更新は不要 (チャーンが増えて陳腐化しやすい)。コードから派生できる**仕様や詳細**は書かない (技術スタック一覧 / フィールド一覧 / 全 ESLint ルールなど)。ただし以下は文脈として記載してよい:

- 運用のためのコマンド例 (`gh ...` / `yarn ...` 等) — 読み手の作業効率向上のため
- 落とし穴の原因となるバージョン情報 (`target ES2020` / `Chakra v3` 等) — 落とし穴の説明として不可分

## ワークフロー

### ブランチとコミット

- ブランチ名: `issue/<番号>` (例: `issue/40`)
- コミットメッセージ: `[#<issue>]<type>: <説明>` 形式。type は `add` / `update` / `fix` / `refactor`
- **`Co-Authored-By:` トレーラーは付けない** (Claude Code のデフォルト指示を上書き)
- 1 PR を論理的に複数コミットに分割する (機能追加とサンプルデータ更新を分ける等)

### PR

- タイトル: `[#<issue>] <説明>`
- 本文は `## Summary` + `## Test plan` + 末尾の `Closes #<issue>`
- 「既知の今後」項目は PR 本文に書く**前に**別 issue として切り出してリンクする (抜け漏れ防止)

### Copilot レビュー対応

- インラインコメントには `gh api -X POST repos/.../pulls/N/comments -F in_reply_to=<id> -f body='...'` で**個別に返信**する。サマリの `gh pr comment` は付けない (冗長)
- 修正コミットを push → 返信 → thread を resolve の順:
  ```bash
  gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "..."}) { thread { isResolved } } }'
  ```
- Copilot 再リクエストは API では動かない → UI の「Re-request review」ボタンを使う

## 既知の落とし穴

### 環境/ツール
- `Array.prototype.at()` は使えない (target ES2020)。`arr.length === 0` チェック + `arr[0]` で対処
- `yarn lint 2>&1 | grep familyTree` だとファイル名行しか拾えない (エラー行は別行)。最終行の `✖ N problems` で総数を見る

### ESLint で頻繁に引っかかるもの
- `@stylistic/object-property-newline`: 複数プロパティを同一行に並べない (`{a: 1, b: 2}` 不可)。各プロパティを別行にするか、型なら named interface に抽出する
- `@stylistic/jsx-one-expression-per-line`: JSX 子要素にテキストと式を混ぜない。`{` ``第${n.toString()}世代`` `}` のように template literal にまとめる
- `@typescript-eslint/restrict-template-expressions`: 数値は `.toString()` で文字列化
- `@typescript-eslint/strict-boolean-expressions`: `if (str)` 不可、`str !== ''` 等で明示
- `@typescript-eslint/no-unnecessary-condition`: 型上 undefined にならないチェックは無効。`noUncheckedIndexedAccess` が off なので `arr[0]` は `T` 型 → 配列の length チェックで防御する
- `max-lines-per-function: 50` は `.ts` のみ (`.tsx` は対象外)。長い関数は小さなヘルパに分割

### CSS / レイアウト
- `<input type="file">` の change イベントは同じファイルを再選択しても発火しない。click 前に `inputRef.current.value = ''` でリセットする
- CSS Grid `1fr` はコンテンツ幅に拡張される。内側で `overflowX:auto` したい時は `templateColumns="repeat(N, minmax(0, 1fr))"` にする
- Flex 子の SVG は `flex-shrink: 1` で縮む。横スクロールを効かせたい時は SVG を `<Box flexShrink={0}>` でラップする
- Chakra v3 の `<Button>` デフォルトはテキストが見えづらいことがある。既存の `PrimaryButton` を使うか variant を明示する
