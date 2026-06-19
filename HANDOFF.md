# 開発引き継ぎメモ（集まれナンシキ村）

別のPC・別のClaude Code(CLI)セッションで開発を続けるための資料です。
このファイルだけ読めば再開できることを目指しています。

最終更新: 2026-06-13

---

## 1. これは何か

ソフトテニスのパートナーペットWebアプリ「**集まれナンシキ村**」。
**静的なHTML/CSS/JSのみ**（ビルド工程・npm依存なし）。ブラウザだけで完結します。

公開URL（GitHub Pages）: https://kakigawatei.github.io/soft-tennis-buddy/

## 2. まず最初にやること（新PC側）

```sh
# リポジトリを取得
git clone https://github.com/kakigawatei/soft-tennis-buddy.git
cd soft-tennis-buddy

# 作業ブランチに切り替え（mainではなくこちらで開発する）
git checkout claude/soft-tennis-buddy

# ローカルで動かす（どちらでも可）
python3 -m http.server 4173
#   → ブラウザで http://127.0.0.1:4173/ を開く
```

GitHub CLI(`gh`)でpush・Pages操作をするので、新PCでも `gh auth login`（アカウント: kakigawatei）を済ませておくこと。

## 3. リポジトリ / ブランチ / デプロイ

| 項目 | 値 |
|---|---|
| GitHub | `kakigawatei/soft-tennis-buddy` (public) |
| 作業ブランチ | `claude/soft-tennis-buddy` ← **常にここで作業** |
| main | 初期コミットのみ。直接さわらない |
| デプロイ | GitHub Pages、`claude/soft-tennis-buddy` ブランチの `/`（ルート）から配信 |
| 反映 | **push すれば自動ビルド・自動公開**（30秒〜2分）。特別な操作は不要 |

公開反映の確認例:
```sh
curl -s https://kakigawatei.github.io/soft-tennis-buddy/game.js | grep -q "探したい文字列" && echo deployed
```

## 4. ファイル構成

```
index.html              画面の骨組み（全パネル・設定シート・採点票の器）
game.js   (約3500行)    ロジック全部。機能が多いので編集前に既存構造を読むこと
style.css (約2150行)    スタイル全部
manifest.webmanifest    PWA定義（アプリ名・アイコン）
sw.js                   service worker（ネット優先＋オフライン時キャッシュ）
assets/                 キャラ表情PNG（kon-*, lee-*）, スプライトシート, アプリアイコン
.claude/launch.json     ローカルプレビュー用（python http.server 4173）
README.md               機能一覧（ユーザー視点）
HANDOFF.md              このファイル
```

## 5. 開発のお作法（重要・厳守）

- **mainには直接コミットしない**。`claude/soft-tennis-buddy` で作業。
- **変更は小さく分けてコミット**する。
- **game.js は大きい**ので、編集前に該当箇所の既存構造を grep して読む。
- 変更後は必ず **`node --check game.js`** で構文チェック。
- コミットメッセージ末尾に:
  ```
  Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
  ```
- **キャッシュバスター必須**（これを忘れると更新がユーザーに届かない）:
  - HTMLが読む `style.css?v=...` / `game.js?v=...` のクエリを更新する（index.html 内、現在 `?v=20260612-backup`）。
  - 表情PNGを差し替えたら game.js の `SPRITE_VERSION`（現在 `"20260610-heartfix2"`）を更新する。
  - アイコン差し替え時は manifest と index.html の `icon-*.png?v=...` を更新する。

## 6. データモデル（全部ブラウザの localStorage）

サーバー・DBは無い。キー一覧:

```
buddy-name, buddy-character, buddy-color
buddy-daily          今日の作戦・調子・ミッション
buddy-bond           絆レベル/XP/成長ログ
buddy-preferences    話し方・コーチ方針・役割・レベル・目標・scoreMode(simple|analysis)
buddy-match-prep     試合前チェックリスト
buddy-score          進行中の試合スコア（newScoreState の構造）
buddy-results        試合・練習の記録（最大300件）★ユーザーの資産
buddy-sprite-data, buddy-sprite-frame   読み込んだスプライト
buddy-wall-rally-best 壁打ちミニゲームのベスト記録
```

`buddy-results` の各要素は `type: "match" | "practice"`。
試合(`match`)は `match: { format, opponent, won, games, players, opponents, log }` を持ち、
`log` の各ポイントが `{ g(ゲーム番号), side(us|them), player(1|2自選手), opp(1|2相手選手), reason(point|miss|oppmiss|dfault), serve(us|them), server(1|2), firstIn(bool) }`。
この log から `scoreAnalysisStats()` が選手別・相手別の得点/ミス/1stサーブ率/Wフォルト率を集計し、採点票・試合詳細分析・結果サマリーを生成している。

## 7. 主要機能と該当関数（game.js）

| 機能 | 関数 |
|---|---|
| スコア状態の生成 | `newScoreState()` |
| 得点加算・ゲーム/サーブ交代 | `addScorePoint()`（2ポイントごとにサーバー交代、ファイナルはチーム交互） |
| 分析集計 | `scoreAnalysisStats()` |
| スコアボード描画 | `renderScoreBoard()`（simple/analysis 2モード） |
| 結果メモへ保存 | `saveScoreToResults()` |
| 採点票（JSTA公式準拠）描画 | `renderJudgePaper()`（画面=自動縮小, 印刷=A4等倍） |
| 結果タブ（練習/試合）と試合詳細グラフ | `renderResults()` / `renderMatchDetail()` |
| バックアップ書き出し/読み込み | `exportData()` / `importData()` |
| 全保存 | `saveStore()` |

UI構成: 上半分=キャラクター画面、下半分=タブ内容、最下部に固定タブ
（今日 / 相談 / 練習 / 試合前 / スコア / 結果 / ルール）。

## 8. 採点票について

日本ソフトテニス連盟「ダブルス・シングルス採点票」様式に準拠。
参照した公式PDF:
- 採点票: https://www.jsta.or.jp/wp-content/uploads/rule/gradingvote_2.pdf
- 記入要領: https://www.jsta.or.jp/wp-content/uploads/rule/methodgrading_2.pdf

## 9. 次にやる予定（未着手）

**案2: クラウド自動同期** — 現状は記録が端末ごとのlocalStorageで、手動の
エクスポート/インポート（案1, 実装済み）で端末間移行している。次は Firebase
(Firestore + 認証) で複数端末の自動同期・蓄積を実装する計画。
- 必要: ユーザーのGoogleアカウントで Firebase プロジェクト作成（無料枠で足りる）
- 子ども利用を想定し匿名ログイン or 保護者ログインを検討
- localStorage を「ローカルキャッシュ」、Firestore を「正」にする設計に寄せる

## 10. CLIセッション特有のメモ

- ローカル確認は `python3 -m http.server 4173`（`.claude/launch.json` 同等）。
- スマホ実機で見るときは `python3 -m http.server 4175 --bind 0.0.0.0` でLAN公開し、
  同一Wi-FiのスマホからMacのIP:4175 へアクセス（公開済みなのでPagesのURLでも可）。
- 検証はブラウザで実際に操作して確認する文化。Pagesに上げる前に必ず動作確認。
