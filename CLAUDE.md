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
- コミットメッセージ: `[#<issue>]<type>: <説明>` 形式。type は `add` / `update` / `fix` / `refactor` / `docs`
- **`Co-Authored-By:` トレーラーは付けない** (Claude Code のデフォルト指示を上書き)
- 1 PR を論理的に複数コミットに分割する (機能追加とサンプルデータ更新を分ける等)
- ローカルでは `.githooks/commit-msg` (有効化: `yarn hooks:install`) が commitlint を走らせて形式違反を弾く。CI と同じ検証

### PR

- タイトル: `[#<issue>] <説明>`
- 本文は `## Summary` + `## Test plan` + 末尾の `Closes #<issue>`
- **スコープ外の課題は判断したその場で issue 化する**: PR 本文や issue 本文に「これは別件」「これは別 PR で」と書いた時点で、対応する issue を立ててリンクする。後でまとめてやろうとすると漏れる
- 「既知の今後」項目も同様に、PR 本文に書く**前に**別 issue として切り出してリンクする

### Copilot レビュー対応

- インラインコメントには `gh api -X POST repos/.../pulls/N/comments -F in_reply_to=<id> -f body='...'` で**個別に返信**する。サマリの `gh pr comment` は付けない (冗長)
- 修正コミットを push → 返信 → thread を resolve の順:
  ```bash
  gh api graphql -f query='mutation { resolveReviewThread(input: {threadId: "..."}) { thread { isResolved } } }'
  ```
- Copilot 再リクエストは API では動かない → UI の「Re-request review」ボタンを使う

## 依存追加時のサプライチェーン対策

新しい依存パッケージや GitHub Actions を追加するときは、以下をチェック:

- **パッケージの素性**: メンテナ / 更新頻度 / GitHub stars / 既知の incident。typosquat (似た名前のパッケージ) に注意
- **postinstall / install スクリプト**: `.yarnrc.yml` で `enableScripts: false` を設定済み。新しい依存に build script があると `yarn install` で警告が出る。
  - **運用**: Yarn 4 では個別パッケージの allow-list が直接的にないため、特定パッケージの build script が必要な場合は一時的に `enableScripts: true` で `yarn install` を実行し、その後 `false` に戻す。`yarn.lock` の差分はそのまま残せばOK
  - **既知の副作用**: macOS で Vite/chokidar が依存する `fsevents` のネイティブ binary がビルドされず、`yarn dev` のファイル監視が polling にフォールバックして性能劣化する。問題が出たら上記の手順で回避
- **新規パブリッシュの即時 install を防ぐ**: `.yarnrc.yml` の `npmMinimalAgeGate: 4320` (分 = 3 日) によって、3 日未満の新規 publish は install されない。即時に削除される悪意のあるパッケージから守る
  - **例外運用**: 緊急のセキュリティ修正で 3 日未満のバージョンを入れたい場合は、`yarn config set npmMinimalAgeGate <小さい値>` で一時的に下げて install し、終わったら元に戻す (.yarnrc.yml への commit 戻しを忘れずに)
  - **Dependabot 側にも `cooldown` 設定**: `.github/dependabot.yml` で publish からの待機日数を指定し、PR 作成時点でも同様に遅延させている (二重防御)
- **`yarn.lock` の diff レビュー**: PR で `yarn.lock` の変更を必ず目視確認 (予期せぬ大量更新は怪しい)
- **GitHub Actions は SHA pin**: `uses: org/action@<40桁の commit SHA>` で固定し、`@v4` のような可変タグは避ける (タグは後から移動できる)
- **第三者製 Actions は最小限**: 公式 (`actions/*`) を優先
- **Dependabot PR の merge は手動**: 自動 merge は無効。major / minor / patch を分けて diff レビュー

## 既知の落とし穴

### 環境/ツール
- `Array.prototype.at()` は使えない (target ES2020)。代替: `at(0)` 相当なら length チェック + `arr[0]`、`at(-1)` 相当なら `arr[arr.length - 1]`。多用するなら `tsconfig.app.json` の `lib` を `ES2022` に上げる選択肢もあり
- `yarn lint 2>&1 | grep familyTree` だとファイル名行しか拾えない (エラー行は別行)。最終行の `✖ N problems` で総数を見る

### ESLint で頻繁に引っかかるもの
- `@stylistic/object-property-newline`: 複数プロパティを同一行に並べない (`{a: 1, b: 2}` 不可)。各プロパティを別行にするか、型なら named interface に抽出する
- `@stylistic/jsx-one-expression-per-line`: JSX 子要素は 1 行 1 つにする (テキスト + 式の混在不可)。対処は (a) テキストと式を別行に分割するか、(b) `{` ``第${n.toString()}世代`` `}` のように 1 つの template literal にまとめる
- `@typescript-eslint/restrict-template-expressions`: 数値は `.toString()` で文字列化
- `@typescript-eslint/strict-boolean-expressions`: `if (str)` 不可、`str !== ''` 等で明示
- `@typescript-eslint/no-unnecessary-condition`: 型上 undefined にならないチェックは無効。`noUncheckedIndexedAccess` が off なので `arr[0]` は `T` 型 → 配列の length チェックで防御する
- `max-lines-per-function: 50` は `.ts` のみ (`.tsx` とテストファイル `.test.ts` は対象外)。長い関数は小さなヘルパに分割

### テスト
- ユニット/コンポーネントテストは Vitest (`yarn test`、jsdom)、ページ全体の E2E は Playwright (`yarn e2e`)。Vitest の `include` は `src/**/*.test.{ts,tsx}` に絞ってあり、`e2e/*.spec.ts` は拾わない (両者の `test`/`expect` import 元が違うので混ざると壊れる)
- Playwright のブラウザは `enableScripts: false` のため `yarn install` で自動取得されない。`yarn playwright install chromium` を手動実行する。CI は `--with-deps` でシステムライブラリも入れる
- e2e は `tsconfig.app.json` の対象外。型解決のため `tsconfig.e2e.json` を用意し eslint の `parserOptions.project` にも追加してある
- Playwright の project で機能 E2E (`yarn e2e` = `--project=e2e`) と VRT (`yarn vrt` = `--project=vrt`) を分離。`visual.spec.ts` のみ vrt project。新規の機能 E2E は `e2e` project が自動で拾う (visual.spec.ts 以外)
- VRT の baseline はフォント差で誤検知しないよう**必ず公式 Docker イメージ `mcr.microsoft.com/playwright:v<version>-noble` + `fonts-noto-cjk`** で生成・比較する。ローカルの素の chromium で生成すると日本語が豆腐になり CI と一致しない。更新は `VRT Update Baselines` ワークフロー (手動) → artifact を展開し、最終的に `e2e/__screenshots__/visual.spec.ts/*.png` の配置になるよう commit (二重階層 `e2e/__screenshots__/e2e/...` にしないこと)

### CSS / レイアウト
- `<input type="file">` の change イベントは同じファイルを再選択しても発火しない。click 前に `inputRef.current.value = ''` でリセットする
- CSS Grid `1fr` はコンテンツ幅に拡張される。内側で `overflowX:auto` したい時は `templateColumns="repeat(N, minmax(0, 1fr))"` にする
- Flex 子の SVG は `flex-shrink: 1` で縮む。横スクロールを効かせたい時は SVG を `<Box flexShrink={0}>` でラップする
- Chakra v3 の `<Button>` デフォルトはテキストが見えづらいことがある。既存の `PrimaryButton` を使うか variant を明示する
- Chakra v3 の `<Checkbox.Control>` は未チェック時の枠線が薄く存在に気づきにくい。`variant="outline"` + `borderColor="border.emphasized"` / `borderWidth="1px"` を明示する
