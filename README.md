# Aprender Español

DELE B2 合格に向けた、自分専用のスペイン語学習アプリです。

- **計画**：試験（DELE / SIELE / 西検）とレベルを選ぶと、試験日・申込締切を反映し、試験日から逆算した週ごとのタスクを表示
- **会話**：Gemini と スペイン語で会話。フリートーク / DELEのテーマ別トーク / B2口頭試験の模擬（Tarea 1〜3）。返答ごとに日本語訳と、自分の文の直し付き
- **記録**：会話はテーマごとに自動保存。テーマ別に回数と最終日を表示し、過去の会話を読み返したり続きから話したりできる
- **ノート**：会話で直された表現が自動でたまる（テーマで絞り込み可）
- **設定**：Gemini APIキーとモデル、JSONでのバックアップ・読み込み

## はじめかた

1. Node.js（v20以上）を入れる：https://nodejs.org
2. Cursor でこのフォルダを開き、ターミナルで

   ```bash
   npm install
   npm run dev
   ```

   ブラウザが開きます（http://localhost:5173）。
3. Google AI Studio（https://aistudio.google.com/apikey）でAPIキーを発行し、アプリの「設定」タブに貼り付けて「接続テスト」。
   `.env.example` を `.env` にコピーしてキーを書いておく方法でもOK。

## データの保存場所

すべてブラウザの localStorage に保存されます（このパソコンのこのブラウザだけ）。
ブラウザを変える・パソコンを変えるときは「設定 → バックアップ → 書き出す」でJSONを保存し、移行先で読み込んでください。

> APIキーはブラウザ内に保存され、Gemini へ直接送られます。キーはビルドに含めないこと（公開用ビルドでは `.env` に `VITE_GEMINI_API_KEY` を書かない）。

## スマホで使う（GitHub Pages）

公開URL：https://sho0330mr07-prog.github.io/aprender-espanol/

- iPhone：Safari で開く → 共有 → 「ホーム画面に追加」
- Android：Chrome で開く → メニュー → 「ホーム画面に追加」／「アプリをインストール」

APIキーと学習データは端末ごとに別々です。スマホでも設定タブでキーを入力してください。友人にはURLを送り、各自のキーを使ってもらいます。

更新したら `npm run deploy` で公開版に反映されます（ビルドして gh-pages ブランチへ push）。

## ファイル構成

```
index.html        画面の骨組み（タブごとの <section>）
src/main.js       起動・タブ切り替え・設定とバックアップ
src/data.js       DELE日程、学習フェーズ、週タスク、会話テーマ、口頭試験の課題
src/store.js      localStorage への保存、会話データの形
src/gemini.js     Gemini API クライアント（ストリーミング、モデル一覧）
src/plan.js       計画タブ
src/chat.js       会話タブ（AIへの指示文 = systemPrompt）
src/records.js    記録タブ・ノートタブ
src/style.css     デザイン（色・フォントは :root の変数）
```

## よくある手直し

- **翌年のDELE日程に更新**：`src/data.js` の `DELE_SESSIONS` と `DELE_REGISTRATION_OPENS`
- **会話テーマを増やす**：`src/data.js` の `THEMES` に1行追加
- **AIの話し方や添削の仕方を変える**：`src/chat.js` の `systemPrompt`

## 今後の候補

- 作文添削（DELE B2 作文 Tarea 1・2 の形式と語数）
- 単語帳（間隔反復）。会話で出た単語を追加
- 音声入力・読み上げ（口頭試験練習用）
- 学習ログ（連続日数、技能別の学習時間）
