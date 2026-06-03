# SRI Web Analytics Dashboard

www.sri-net.co.jp のWebサイト分析・改善管理ダッシュボード

## 機能一覧

- **ダッシュボード**: GA4 + Search Console データのリアルタイム可視化
- **タスク管理**: 未着手 → 完了 → 検証済み のライフサイクル管理
- **改善提案**: 分析データに基づく10件の改善提案とタスク移管
- **AIチャット**: データに基づく改善アドバイザーとの対話
- **週次レポート**: 検証結果をMarkdownでGoogle Driveに自動保存
- **複数人共有**: URLを共有するだけで全員が同じデータを閲覧・操作

---

## セットアップ手順

### 前提条件

- Node.js 18以上がインストールされていること
- GitHubアカウント
- Googleアカウント（Firebase + Google Drive用）
- Anthropic APIキー（https://console.anthropic.com で取得）

---

### 手順1: プロジェクトのインストール

```bash
cd sri-dashboard
npm install
```

---

### 手順2: Firebase の設定

**2-1. Firebaseプロジェクトの作成**

1. https://console.firebase.google.com にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名: `sri-dashboard`（任意）
4. Google Analyticsは無効でOK → 「プロジェクトを作成」

**2-2. Firestore Database の有効化**

1. 左メニュー「Firestore Database」
2. 「データベースを作成」
3. 「テストモードで開始」を選択（後からセキュリティルール設定）
4. ロケーション: `asia-northeast1`（東京）を選択
5. 「有効にする」

**2-3. ウェブアプリの追加**

1. プロジェクトの概要ページ → 歯車アイコン → 「プロジェクトの設定」
2. 「マイアプリ」セクション → ウェブアプリ追加（`</>`アイコン）
3. アプリ名: `sri-dashboard`
4. 「Firebase Hosting も設定する」はチェック不要
5. 「アプリを登録」
6. 表示される設定（apiKey, authDomain 等）をコピー

**2-4. 設定の貼り付け**

`src/firebase.js` を開き、`firebaseConfig` の値を貼り付けます:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",           // ← ここを置き換え
  authDomain: "sri-dashboard-xxxxx.firebaseapp.com",
  projectId: "sri-dashboard-xxxxx",
  storageBucket: "sri-dashboard-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

### 手順3: 環境変数の設定（ローカル開発用）

```bash
cp .env.example .env
```

`.env` ファイルを開き、Anthropic APIキーを設定:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
```

---

### 手順4: ローカルで動作確認

```bash
npm run dev
```

ブラウザで http://localhost:5173 にアクセスし、ダッシュボードが表示されればOK。

---

### 手順5: GitHubにアップロード

```bash
git init
git add .
git commit -m "初回コミット: SRI Dashboard"
```

GitHubで新しいリポジトリを作成し:

```bash
git remote add origin https://github.com/あなたのユーザー名/sri-dashboard.git
git push -u origin main
```

---

### 手順6: Netlify にデプロイ

**6-1. Netlifyアカウント作成**

1. https://app.netlify.com にアクセス
2. GitHubアカウントでサインアップ

**6-2. サイトの作成**

1. 「Add new site」→「Import an existing project」
2. 「GitHub」を選択
3. `sri-dashboard` リポジトリを選択
4. ビルド設定（自動で入るが確認）:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 「Deploy site」をクリック

**6-3. 環境変数の設定（重要!）**

1. Netlify管理画面 → Site configuration → Environment variables
2. 「Add a variable」で以下を追加:

| Key | Value |
|-----|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-xxxxx` |

3. 「Deploys」→「Trigger deploy」→「Deploy site」で再デプロイ

**6-4. URLの確認**

デプロイ完了後、`https://sri-dashboard-abc123.netlify.app` のようなURLが発行されます。
このURLをチームメンバーに共有してください。

---

## Google Driveへのレポート保存

検証済みタスクのレポートは以下のフォルダに自動保存されます:

**フォルダ:** HP改修
**URL:** https://drive.google.com/drive/folders/1X0S4y0zCxhnVY7Br10aFWLZoKJCEwfT9

- ダッシュボードの「📄 レポート出力」ボタンで保存
- ファイル名: `SRI改善レポート_YYYY-MM-DD.md`
- 同じ週のレポートは重複保存されません

---

## ファイル構成

```
sri-dashboard/
├── index.html              # エントリーHTML
├── netlify.toml            # Netlify設定
├── package.json            # 依存パッケージ
├── vite.config.js          # Vite設定
├── .env.example            # 環境変数テンプレート
├── .gitignore
├── netlify/
│   └── functions/
│       └── anthropic-proxy.mjs  # APIプロキシ（サーバーレス関数）
└── src/
    ├── main.jsx            # Reactエントリー
    ├── App.jsx             # メインダッシュボード
    ├── api.js              # API呼び出しヘルパー
    └── firebase.js         # Firebase設定・DB操作
```

---

## 運用ガイド

### 日常の使い方

1. ダッシュボードにアクセス
2. 期間を選択して「更新」→ 最新データを取得
3. 「💡改善提案」から優先タスクを確認
4. タスクを実施したら「完了」→ 検証期間後に「検証」
5. 毎週日曜に「レポート出力」でGoogle Driveに保存

### カスタムURLの設定（任意）

Netlify管理画面 → Domain settings → Custom domain で独自ドメインを設定可能。
例: `analytics.sri-net.co.jp`

### セキュリティ強化（任意）

チーム外からのアクセスを防ぐ場合:
- Firebase Authentication でログイン機能を追加
- Netlify Identity でBasic認証を設定（最も簡単）
