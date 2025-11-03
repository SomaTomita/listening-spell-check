## IELTS リスニング穴埋め練習アプリ 要件定義

### 概要

- ローカルサーバ（Node.js + Express）とフロント（Vite + React）で構成。単語リストは `assets/words.json` に保存。
- 出題は「一問一答の書き取り（dictation）」のみ。3, 2, 1 のカウントダウン後にランダムで 1 語を 1 回だけ再生し、入力欄にタイプして即時採点。
- 設定は `localStorage`、ミス語統計とモチベ統計は `SQLite` に保存。外部ネットワークは使用しない。

---

### 1. 目的

- IELTS 特有 の「リスニングのスペリング」だけに特化して対策ができる高速反復可能なツールが不足している課題の解決がしたい。
  - ローカル TTS 音声（say ライブラリ）で単語を聞き取り
  - 入力欄に正確にスペリング
  - 即時採点・軽い復習（発音再生と意味表示）

### 2. スコープ

- 対象: 提供の英単語リスト（741 語）。
- 非対象: ストーリー生成、長文読解、外部 API。

### 3. ユースケース

- UC-01: 「練習開始」 → 3, 2, 1 のカウントダウンで準備 → ランダムで 1 語を TTS で 1 回だけ再生 → 入力 → 即時採点 → 次の語へ。→ ランダムに再生の繰り返し
- UC-02: 直近ミス語の重み付け再出題。
- UC-03: 再生回数は固定で 1 回（カウントダウン時に注記表示）。間隔（インターバル）調整は任意。英/米綴りの正規化。
- UC-04: その場限り or 軽い記録（ローカルのみ）。

### 4. 機能要件（FR）

- FR-1 ランダム出題: 語彙から 1 語を抽選（重み付け抽出対応、重複許容）。
- FR-2 音声再生: ローカルサーバの TTS ライブラリで単語を読み上げ。音量/声種選択。再生回数は 1 回。
- FR-3 入力と採点: 入力欄 1 つ。即時採点（Enter のみ）。大文字小文字・ハイフン/スペース揺れ、英/米綴り差異を正規化。
- FR-4 フィードバック: 正誤表示と正解のスペルを中央オーバーレイで提示（常に表示）。
- FR-5 連続練習: 正誤後は Cmd+Enter で次の語へ（ボタンは無し）。
- FR-6 設定保持: 音声設定（声種/音量）・ダークモードを `localStorage` に保存。
- FR-7 キーボード: Cmd+R でカウントダウン開始（再生 1 回）、Enter 採点、Cmd+Enter 次へ。
- FR-9 モチベ管理: 1 日の回答数、連続日数（streak）、今週合計を簡易表示。
- FR-10 音声一覧: サーバは利用可能な声種を返す `/api/voices` を提供し、設定画面で選択可能にする。
- FR-11 統計保存: ミス語統計とモチベ統計を `SQLite` に保存し、API で取得/更新可能とする。

### 5. 非機能要件（NFR）

- NFR-1 ローカルサーバの使用: 外部ネットワーク不要。音声はローカルサーバ経由で macOS の `say` により生成。
- NFR-2 起動 < 2s（2 回目以降）。音声再生待ち < 200ms（キュー済み時）。
- NFR-3 アクセシビリティ: スクリーンリーダー対応、コントラスト準拠、キーボード操作。
- NFR-4 セキュリティ: データは端末内のみ。外部送信なし。
- NFR-5 可搬性: macOS Safari/Chrome 最新を主対象。Windows は考慮外でも可（将来拡張）。

### 6. データモデル

- 語彙（`Word`）

```json
{
  "en": "accountant",
  "ja": "会計士",
  "tags": ["profession"],
  "variants": ["accountants"],
  "spellingMap": { "colour": "color", "theatre": "theater" },
  "source": "IELTS-list"
}
```

- モチベ統計（`MotivationStats`）

```json
{
  "todayCount": 37,
  "streakDays": 5,
  "weekTotal": 142,
  "lastUpdated": "2025-10-19"
}
```

#### 6.1 DB スキーマ（SQLite）

```sql
-- ミス語統計（語ごと累積 + 直近傾向）
CREATE TABLE IF NOT EXISTS mistakes (
  word TEXT PRIMARY KEY,
  seen INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  streak_wrong INTEGER NOT NULL DEFAULT 0,
  last_ts INTEGER
);

-- モチベ統計（単一レコード管理）
CREATE TABLE IF NOT EXISTS motivation (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  today_count INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  week_total INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT
);
```

### 7. 出題・採点アルゴリズム（擬似コード）

```ts
// 1) 出題語選択（直近ミス強調 + 全体ミス考慮）
//    weight = 1 + min(3, streakWrong) + min(2, totalWrong) + recencyBonus
//    recencyBonus = last_ts が48h以内なら +1、それ以外 0
const pickUpWord = async pool => {
  // DB: mistakes から該当語の seen, correct, streak_wrong, last_ts を読み込む
  // totalWrong = max(0, seen - correct)
  // weight を計算し、重み付きランダムで1語を返す
}

// 2) カウントダウン → TTS 再生（単語は 1 回のみ）
const speakOnce = async (word, { voice, volume }) => {
  // UI: 3 → 2 → 1 表示（1 秒間隔）
  // フロント: GET /api/tts?text=word&voice=Daniel
  // サーバ: say.export() で一時 wav 生成 → ストリーム返却
  // フロント: Audio で volume 設定し一度だけ再生、再再生は不可
}

// 3) 採点（正規化 + 綴りゆらぎ）
const normalize = s => {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, '')
    .replace(/\s+/g, ' ')
}

const spellingEqual = (input, answer, spellingMap) => {
  const i = normalize(input)
  const a = normalize(spellingMap[input] || answer)
  return i.replace(/[-\s]/g, ' ') === a.replace(/[-\s]/g, ' ')
}

// 4) 統計更新（SQLite）
const recordResult = (word, isCorrect) => {
  // DB: mistakes.seen++, correct++, streak_wrong を更新、last_ts=now
  // DB: motivation.today_count++, streak_days/week_total は日付/週の境界で更新
}
```

### 8. 画面/UX

- 8.1 ホーム: 中央にタイトルと「今すぐ練習」。
- 8.2 練習画面:
  - 3-2-1 カウントダウンは画面全体を薄暗くするフルスクリーン・オーバーレイで中央表示（操作ブロック）。
  - 再生は 1 回のみ。再生ボタンは常時表示だが、再生後の再押下は中央ガードで通知。
  - 入力は 1 つ。Enter で採点。採点後の Enter は無効（ダブルカウント防止）。
  - 次へは Cmd+Enter のみ。未採点時はガード表示。
  - 正誤 + スペルは中央オーバーレイで表示（黒の透過背景、クリック不可）。
- 8.3 アクセシビリティ: フォーカスリング、キーボードショートカット案内（ノート、結果ポップアップ）。

### 9. 設定（例）

- 音声: voice（英/米）/ volume（0–1）。デフォルト声種: 英(US) Samantha または 英(UK) Daniel（UI 選択）。
- 出題: ミス重み付け強度のみ。
- 表記: 英/米綴り許容 / ハイフン・スペース許容。
- 表示: ダークモード（手動切替のみ。自動切替は非対応） / フォントサイズ。

### 10. 永続化方針

- 設定: `localStorage` に保存（JSON）。
- 統計: `SQLite`（`better-sqlite3`）に保存。
  - テーブル: `mistakes`, `motivation`（上記スキーマ）。
  - API 経由で読み書きし、直接ファイル操作は行わない。

### 11. 技術スタック

- バックエンド（ローカルサーバ）: Node.js + Express（TypeScript）。Node バージョン: 22.x（`.nvmrc` で固定）。
- 音声: `say`（macOS の `say` をラップ）でローカル合成。
- フロント: Vite + TypeScript + React。
- データ: `assets/words.json` のみ。
- UI フレームワーク: MUI(Material-UI)

#### 11.1 npm インストール

```bash
npm install express cors say nanoid better-sqlite3 axios
npm install -D typescript ts-node nodemon @types/node @types/express concurrently
npm install @mui/material @emotion/react @emotion/styled
```

#### 11.2 API エンドポイント

- GET `/api/health` → 200 OK（起動確認）
- GET `/api/voices` → `{ voices: string[] }`（例: ["Alex","Samantha","Daniel","Serena", ...]）
- GET `/api/tts?text={word}&voice={name}&speed={0.5..1.5}` → audio/wav ストリーム（1 回再生想定）。
  - 速度未指定時は 0.9。失敗時は `voice` → `Alex` → 未指定の順でフォールバック。
- POST `/api/stats/result` → `{ word: string, correct: boolean, ts?: number }` を受け取り、`mistakes` と `motivation` を更新
- GET `/api/stats/mistakes` → `{ [word: string]: { seen: number, correct: number, streakWrong: number, lastTs?: number } }`
- GET `/api/stats/motivation` → `{ todayCount: number, streakDays: number, weekTotal: number, lastUpdated: string }`

#### 11.3 開発/起動スクリプト（例）

```jsonc
{
  "scripts": {
    "dev:server": "nodemon --watch server --exec ts-node server/app.ts",
    "dev:client": "vite",
    "dev": "concurrently \"npm:dev:server\" \"npm:dev:client\"",
  },
}
```

#### 11.4 エラーハンドリング

- サーバ: 500 時は JSON で理由を簡潔返却。TTS 失敗時はフォールバック声種に切替。
- クライアント: トースト表示（MUI Snackbar）。再試行ボタンなし（1 回再生原則）。

### 12. ディレクトリ構成

```
spell-practice-listening/
  assets/
    words/
      words.json                         # 語彙ソース（単一ファイル）
  server/
    app.ts                               # Express起動
    db.ts                                # better-sqlite3 初期化/CRUD
    routes.ts                            # /api/* ルート
    tts.ts                               # say連携（TTS合成・一時ファイル管理）
  client/
    index.html                           # ViteエントリHTML
    vite.config.ts                       # Vite設定（/api 代理）
    src/
      main.tsx
      App.tsx
      theme.ts                           # MUIテーマ
      features/
        practice/
          PracticePage.tsx
          Countdown.tsx
          Overlays.tsx
          usePractice.ts
      lib/
        api.ts
        normalize.ts
        picker.ts
        storage.ts
        types.ts
  package.json
  tsconfig.json
  README.md
  .nvmrc                                  # "v22"
```

### 商標に関する注意

本プロジェクトは IELTS® および関連団体とは一切関係がありません。IELTS は各権利者の登録商標です。本ツールは学習用途の個人利用を想定した非公式のオープンソース実装です。

### 13. モチベ統計（仕様）

- todayCount: 採点完了ごとに +1。日付が変わったら 0 にリセット。
- streakDays: 連続日数。前回更新日が昨日なら +1、同日なら維持、1 日以上空けば 0 にリセット。
- weekTotal: 週合計。ISO 週が変わったら 0 にリセット。
- lastUpdated: 最終更新日（`YYYY-MM-DD`）。

### 14. 受け入れ基準（DoD）

- [ ] 3-2-1 カウントダウンと「この単語は 1 回だけ再生されます」注記が表示され、実際に 1 回のみ再生される。
- [ ] マルチワード語（空白・ハイフン含む）の入力・採点が機能する。
- [ ] 英/米綴り差異、ハイフン/スペース揺れを吸収して正答判定できる。
- [ ] 音量/声種の変更が即時反映される。
- [ ] 設定は `localStorage` に、ミス語統計/モチベ統計は `SQLite` に保持・更新される。

### 15. リスク/制約と対策

- R-1 TTS 品質: システム音声に依存 → 複数声種サポート、将来の速度調整や再生制御は別設定として検討。
- R-2 出題偏り: 重み付けが極端化 → 下限/上限制約、温度パラメータで拡散。
- R-3 マルチワード採点: 空白/ハイフン揺れ → 正規化関数で統一（上記実装）。
- R-4 連続練習疲労: 集中力低下 → 自動インターバル/ポモドーロ表示を設定で任意有効化。

### 16. インポート手順（語彙リスト）

1. 本要件の単語表を `assets/words.json` に以下スキーマで保存。

```json
[{ "en": "accountant", "ja": "会計士", "tags": [] }]
```

2. マルチワードは `en` をそのまま（例: "air conditioning"）。
3. 既知の英/米揺れは `spellingMap` に追記（任意）。

### 17. 実装メモ（最小コード方針）

- 入力欄は 1 つのみ。IMEMode=english を推奨（UI 提示）。
- 採点は `O(1)`。正規化関数を共有化。
- 乱数はシード可能（再現性あるリトライ）: `seedrandom` を使用可（または自前 Xorshift）。
- ショートカットはアクセシブルに（ボタンに `aria-keyshortcuts` を付与）。

### 18. ローカル DB について

- 本要件は `SQLite` を使用し、統計（mistakes/motivation）を端末内で永続化する。
