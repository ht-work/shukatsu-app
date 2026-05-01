# 就活管理アプリ shukatsu-app 設計書

最終更新: 2026-05-01

要件は `docs/requirements.md` を参照。本書ではそれを実現する技術構成と内部設計を定義する。

---

## 1. 技術スタック

| 領域 | 採用技術 | 補足 |
|------|----------|------|
| フレームワーク | Next.js 15 (App Router) | React のデファクト。App Router で進める |
| 言語 | TypeScript | 型による安全性と学習目的を兼ねる |
| UI コンポーネント | shadcn/ui | コンポーネントを自リポジトリにコピーして使う方式。中身が見えるため学習向き |
| スタイリング | Tailwind CSS | shadcn/ui の前提。クラスベースの CSS |
| アイコン | lucide-react | shadcn/ui 標準のアイコンセット |
| 状態管理 | React `useState` + Context API | MVP の規模では十分。必要時に Zustand 等を導入 |
| 永続化 | `localStorage` (Custom Hook でラップ) | 将来クラウド DB に差し替えやすい設計 |
| フォーム | react-hook-form + zod | 入力検証と型推論を両立 |
| 日付処理 | date-fns | 軽量・関数ベース |
| 整形/Lint | Prettier + ESLint | Next.js 標準を流用 |
| パッケージ管理 | npm | Node 同梱で追加インストール不要 |
| デプロイ | (未定) Vercel が候補 | MVP 完了後に検討 |

### 1.1 デザイン方針

- 黒基調のモダンデザイン (ダークテーマをデフォルトかつ唯一のテーマとする)
- 配色:
  - 背景: 深い黒 (`#0a0a0a` 付近)
  - 前景: 高コントラストの白寄りグレー
  - アクセント: 青系 1 色のみ (Tailwind の `blue-500` 〜 `sky-500` あたりから実装時に決定)
- タイポグラフィ: Inter または Geist (Next.js 標準) でシャープに
- 余白を多めに取り、装飾より情報密度のメリハリで魅せる
- アクセシビリティはコントラスト比 4.5:1 以上を維持 (WCAG AA)

---

## 2. 画面一覧

| ID | 画面名 | パス | 概要 |
|----|--------|------|------|
| S1 | ダッシュボード | `/` | 直近の締切・選考中の件数サマリ。アプリの入り口 |
| S2 | 企業一覧 | `/companies` | 登録済み企業の一覧。検索・絞り込み・並び替え |
| S3 | 企業詳細 | `/companies/[id]` | 企業の基本情報 + 紐づくエントリー一覧 + メモ |
| S4 | 企業 新規登録 | `/companies/new` | 企業マスタの登録 |
| S5 | 企業 編集 | `/companies/[id]/edit` | 企業マスタの編集 |
| S6 | エントリー新規登録 | `/companies/[id]/applications/new` | 企業に紐づくエントリーを追加 (本選考/インターン) |
| S7 | エントリー詳細 | `/companies/[id]/applications/[appId]` | 選考ステータス更新・タスク (締切) 一覧・メモ |
| S8 | カレンダー (将来) | `/calendar` | 締切を時系列で俯瞰。Phase 4 |
| S9 | 設定 (将来) | `/settings` | 通知許可・データのエクスポート/インポート |

MVP (Phase 1〜3) は S1〜S7 を実装対象とする。

---

## 3. 画面遷移

```
[S1 Dashboard]
   ├── (リンク) → [S2 企業一覧]
   ├── (締切クリック) → [S7 エントリー詳細]
   └── (新規追加ボタン) → [S4 企業新規登録]

[S2 企業一覧]
   ├── (行クリック) → [S3 企業詳細]
   ├── (新規ボタン) → [S4 企業新規登録]
   └── (絞り込みUI) ← 同一画面内で状態変更

[S3 企業詳細]
   ├── (編集) → [S5 企業編集]
   ├── (エントリー追加) → [S6 エントリー新規登録]
   └── (エントリー行クリック) → [S7 エントリー詳細]

[S7 エントリー詳細]
   └── (戻る) → [S3 企業詳細]
```

ヘッダーには常に「ダッシュボード / 企業一覧 / 設定」へのナビゲーションを配置する。

---

## 4. データモデル

TypeScript の型として定義する。実装時は `src/types/` に配置。

```ts
// 選考種別
export type ApplicationKind = "internship" | "fulltime";

// 応募経路
export type ApplicationSource =
  | "rikunabi"        // リクナビ
  | "mynavi"          // マイナビ
  | "onecareer"       // ONE CAREER
  | "wantedly"        // Wantedly
  | "offerbox"        // OfferBox (逆求人)
  | "direct"          // 企業サイトから直接
  | "referral"        // 紹介・リファラル
  | "career_center"   // 大学キャリアセンター
  | "agent"           // 就活エージェント
  | "other";          // その他 (sourceNote にメモ)

// 選考ステータス (string リテラル union)
export type ApplicationStatus =
  // 共通
  | "interested"          // 興味あり
  | "entry_done"          // エントリー済み (本選考のみ)
  | "es_submitted"        // ES提出
  | "web_test"            // Webテスト
  | "coding_test"         // コーディングテスト
  | "group_discussion"    // グループディスカッション
  | "interview_1"         // 一次面接
  | "interview_2"         // 二次面接
  | "interview_final"     // 最終面接
  // 終端 (本選考)
  | "offered"             // 内定
  | "rejected"            // 不採用
  // 終端 (インターン)
  | "intern_accepted"     // 参加決定
  // 共通終端
  | "declined";           // 辞退

// タスク種別 (締切付きのアクション)
export type TaskKind =
  | "es_deadline"
  | "web_test"
  | "coding_test"
  | "group_discussion"
  | "interview"
  | "other";

// 企業マスタ
export interface Company {
  id: string;             // UUID
  name: string;           // 会社名
  url?: string;           // コーポレートサイト
  industry?: string;      // 業界
  notes?: string;         // 自由メモ
  createdAt: string;      // ISO8601
  updatedAt: string;
}

// エントリー (1企業に複数持てる)
export interface Application {
  id: string;
  companyId: string;
  kind: ApplicationKind;
  status: ApplicationStatus;
  source?: ApplicationSource; // 応募経路
  sourceNote?: string;        // source が "other" のときの自由記入や補足
  myPageUrl?: string;         // 応募者マイページの URL (ID/PW は保存しない方針)
  appliedAt?: string;         // 応募日 (任意)
  notes?: string;             // このエントリーに関するメモ
  createdAt: string;
  updatedAt: string;
}

// エントリーに紐づくタスク (締切付き)
export interface Task {
  id: string;
  applicationId: string;
  kind: TaskKind;
  title: string;          // 例: "ES提出締切"
  dueAt: string;          // ISO8601 (日付のみでも時刻付きでも保持)
  done: boolean;
  notifiedAt?: string;    // 通知済み日時 (重複通知防止)
  createdAt: string;
  updatedAt: string;
}
```

### 4.1 永続化スキーマ

`localStorage` のキーは以下:

| キー | 値 | 備考 |
|------|----|------|
| `shukatsu:companies` | `Company[]` | JSON 文字列 |
| `shukatsu:applications` | `Application[]` | 同上 |
| `shukatsu:tasks` | `Task[]` | 同上 |
| `shukatsu:meta` | `{ schemaVersion: number }` | 将来のマイグレーション用 |

### 4.2 マイページ情報の取り扱い

セキュリティリスク回避のため、本アプリではログイン情報 (ID / パスワード) は保存しない。
`Application.myPageUrl` に URL のみ持ち、ID/PW はブラウザのパスワードマネージャや 1Password 等の専用ツールに任せる。

### 4.3 関連と整合性

- `Application.companyId` は `Company.id` を参照する。
- `Task.applicationId` は `Application.id` を参照する。
- 企業を削除するときは「紐づくエントリー・タスクも削除する」(カスケード削除) を選択。
  - 削除前に確認ダイアログを出す。

---

## 5. ディレクトリ構成

```
shukatsu-app/
├── docs/                      # ドキュメント
│   ├── requirements.md
│   └── design.md
├── public/                    # 静的アセット
├── src/
│   ├── app/                   # Next.js App Router (ページ)
│   │   ├── layout.tsx         # ルートレイアウト (ダークテーマ・ヘッダー)
│   │   ├── page.tsx           # S1 ダッシュボード
│   │   ├── companies/
│   │   │   ├── page.tsx       # S2 企業一覧
│   │   │   ├── new/page.tsx   # S4
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # S3
│   │   │       ├── edit/page.tsx # S5
│   │   │       └── applications/
│   │   │           ├── new/page.tsx        # S6
│   │   │           └── [appId]/page.tsx    # S7
│   ├── components/            # UI コンポーネント
│   │   ├── ui/                # shadcn/ui で生成されるもの
│   │   └── (機能別)/
│   ├── lib/                   # ロジック・ユーティリティ
│   │   ├── storage.ts         # localStorage アクセス層
│   │   ├── id.ts              # UUID 生成
│   │   └── date.ts            # 日付ヘルパ
│   ├── hooks/                 # Custom Hooks
│   │   └── useLocalStorage.ts
│   ├── types/                 # 型定義
│   │   └── index.ts
│   └── styles/
│       └── globals.css        # Tailwind と CSS 変数
├── .gitignore
├── .prettierrc
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 6. 実装順序 (Phase 別タスク分解)

### Phase 0: プロジェクト初期化
1. `create-next-app` で雛形生成 (TS + Tailwind + ESLint + App Router)
2. shadcn/ui の初期化、ダークテーマ設定
3. ヘッダー/レイアウトの骨組み
4. データモデル型を `src/types/index.ts` に追加
5. `useLocalStorage` フックと storage 層を実装

### Phase 1: F1 + F2 (企業登録 + 一覧)
6. S4 企業新規登録フォーム (react-hook-form + zod)
7. S2 企業一覧表示
8. S3 企業詳細 (基本情報のみ)
9. S5 企業編集
10. 削除機能 (確認ダイアログ付き)

### Phase 2: F3 + F4 (選考ステータス + 締切)
11. S6 エントリー新規登録
12. S7 エントリー詳細・ステータス変更
13. タスク (締切) の追加・完了化
14. S1 ダッシュボードの直近締切リスト

### Phase 3: F5 + F6 (絞り込み + メモ)
15. S2 で絞り込み・並び替え UI
16. メモ機能のリッチ化 (改行サポート等)

### Phase 4: F7 + F8 (将来)
17. ics エクスポート (S8 もしくは Task 個別ボタン)
18. ブラウザ通知 (Web Notifications API + setInterval/SW)

---

## 7. 未決事項

- アクセント青の具体トーン (`blue-500` / `sky-500` / `indigo-500` 等) — 実装時に確定
- フォントの最終選定 (Geist で進める仮)
- 通知の発火方式 (タブを開いている間だけか、Service Worker で常駐させるか) — Phase 4 で検討
- データのエクスポート/インポート機能の UI — 設定画面を作るタイミングで設計
