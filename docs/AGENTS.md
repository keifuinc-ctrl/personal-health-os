# Personal Health OS – Agent / Repository Guidelines

> このドキュメントは、Personal Health OS のエージェント開発・AI連携・運用ルールを定義します。
> 
> 関連ドキュメント: [VISION.md](./VISION.md)（理念・ビジョン）、[DEVELOPMENT_ROADMAP.md](./DEVELOPMENT_ROADMAP.md)（開発手順/ロードマップ）

⸻

## 1. プロジェクト概要（Overview）

このリポジトリは **パーソナルヘルスOS（Personal Health OS / KeifuHealth）** における
エージェント開発・AI連携・運用ルールを一元管理するための基盤リポジトリである。

### 中核思想

- **個人主権型データ管理（Self-Sovereign Health Data）**
  - データの所有権は常に本人に帰属
  - データは動かさず、計算・AIをデータの側に送る（Compute to Data）
  - 本人の明示的同意・目的・期間に基づく最小限データ利用

- **拡張可能なOS設計**
  - 医療・介護・ウェルネス・研究を跨ぐ統合プラットフォーム
  - モジュラー設計による段階的機能拡張

- **Beneficiary Platform中心の設計**
  - 患者（Beneficiary）が自分の健康データを主権的に管理
  - 外部電子カルテシステムとの連携（FHIR、SS-MIX2、HL7等）
  - 患者中心の医療・個別化医療・予防医療の実現

- **電子保存の三原則（Electronic Storage Principles）**
  - 真正性（Authenticity）：デジタル署名、改ざん検知、監査ログ
  - 見読性（Readability）：標準フォーマット（FHIR、SS-MIX2、HL7）、長期保存形式
  - 保存性（Preservability）：冗長化、データ移行計画、アクセス制御

### 本リポジトリの役割

- エージェント（AI / MCP / Automation）の設計原則・制約・実装ルールの定義
- セキュリティ・プライバシー前提のAI活用パターンの標準化
- 開発者・AIが共通理解で動くためのルールブック兼ガードレール

⸻



### AI連携

- **エディタ**: Cursor (MCP対応)
- **MCPサーバー**: GitHub, Supabase, Stripe, Vercel, Sentry, Resend（設定済み）
- **CLIツール**: MCP未対応のツール（Cloudflare、AI Gateway、Ably、Vimeoなど）はCLI経由で実行可能

⸻

## 2. 技術ツール一覧（Tools Reference）

### 2.1 MCPサーバー（Cursor統合済み）

エージェントがMCP経由で直接操作可能なサービス一覧：

| サービス | 種別 | MCPサーバー名 | 主な操作 | 認証方法 |
|---------|------|--------------|---------|---------|
| **GitHub** | MCP | `mcp_github` | Issue/PR管理、コード検索、リポジトリ操作 | Personal Access Token |
| **Supabase** | MCP | `mcp_supabase` | DB管理、マイグレーション、SQL実行、テーブル管理 | Access Token |
| **Vercel** | MCP | `mcp_vercel` | デプロイ、環境変数、ドメイン、ログ、Cron | API Token |
| **Sentry** | MCP | `mcp_sentry` | エラー監視、Issue確認、トレース分析 | Auth Token |
| **Resend** | MCP | `mcp_resend` | メール送信、テンプレート管理 | API Key |
| **Cursor Browser** | MCP | `mcp_cursor-browser-extension` | ブラウザ操作、スクリーンショット、DOM操作 | 自動（拡張機能） |

### 2.2 CLIツール

MCP未対応のため、ターミナル経由で操作するツール：

| ツール | 種別 | コマンド | 主な操作 | インストール |
|-------|------|---------|---------|-------------|
| **pnpm** | CLI | `pnpm` | 依存関係管理、スクリプト実行 | `corepack enable` |
| **Git** | CLI | `git` | バージョン管理 | Xcode CLT / Homebrew |
| **Cloudflare Wrangler** | CLI | `wrangler` | Workers/R2/KV管理、デプロイ | `pnpm add -g wrangler` |
| **Supabase CLI** | CLI | `supabase` | ローカルDB、マイグレーション（MCP代替） | `brew install supabase/tap/supabase` |
| **Vercel CLI** | CLI | `vercel` | ローカルデプロイ、環境変数pull（MCP代替） | `pnpm add -g vercel` |
| **GitHub CLI** | CLI | `gh` | Issue/PR操作（MCP代替） | `brew install gh` |
| **TypeScript** | CLI | `tsc` | 型チェック | `pnpm add -D typescript` |
| **ESLint** | CLI | `eslint` | リント | `pnpm add -D eslint` |
| **Prettier** | CLI | `prettier` | フォーマット | `pnpm add -D prettier` |
| **Vitest** | CLI | `vitest` | ユニットテスト | `pnpm add -D vitest` |
| **Playwright** | CLI | `playwright` | E2Eテスト | `pnpm add -D @playwright/test` |

### 2.3 開発コマンド早見表

```bash
# 日常的なコマンド
pnpm dev                    # 開発サーバー起動（http://localhost:3001）
pnpm build                  # 本番ビルド
pnpm typecheck              # TypeScript型チェック
pnpm lint                   # ESLintチェック
pnpm test                   # Vitestユニットテスト
pnpm test:e2e               # Playwright E2Eテスト

# キャッシュクリア（問題発生時）
rm -rf apps/web/.next       # Next.jsキャッシュ削除
pnpm store prune            # pnpmストアクリーン
pnpm install --force        # 依存関係再インストール

# macOS固有（EMFILE対策）
ulimit -n 65536 && pnpm dev # ファイルディスクリプタ制限引き上げ

# ポート解放
lsof -ti:3001 | xargs kill -9  # 3001ポート解放
```

### 2.4 MCP操作例（Cursor内）

```typescript
// GitHub MCP
mcp_github_create_issue({ owner, repo, title, body })
mcp_github_create_pull_request({ owner, repo, title, head, base })
mcp_github_list_issues({ owner, repo, state: "open" })

// Supabase MCP
mcp_supabase_list_projects()
mcp_supabase_list_tables({ project_id })
mcp_supabase_execute_sql({ project_id, query })
mcp_supabase_apply_migration({ project_id, name, query })

// Vercel MCP
mcp_vercel_list_projects({ teamId })
mcp_vercel_list_deployments({ projectId, teamId })
mcp_vercel_get_deployment_build_logs({ idOrUrl, teamId })

// Sentry MCP
mcp_sentry_search_issues({ organizationSlug, naturalLanguageQuery })
mcp_sentry_get_issue_details({ issueUrl })

// Resend MCP
mcp_resend_send_email({ to, from, subject, text })

// Cursor Browser MCP（E2Eテスト・デバッグ用）
mcp_cursor-browser-extension_browser_navigate({ url })
mcp_cursor-browser-extension_browser_snapshot()
mcp_cursor-browser-extension_browser_click({ ref, element })
mcp_cursor-browser-extension_browser_take_screenshot()
```

### 2.5 Cursor Browser Extension使用ガイド

ブラウザ操作ツールの使い方：

1. **ページ遷移**: `browser_navigate` でURLを開く
2. **要素取得**: `browser_snapshot` でアクセシビリティツリーを取得
3. **クリック/入力**: `browser_click`, `browser_type` で操作
4. **スクリーンショット**: `browser_take_screenshot` で視覚確認
5. **コンソール確認**: `browser_console_messages` でエラー確認

```typescript
// 例: ログインフローのテスト
await mcp_cursor-browser-extension_browser_navigate({ url: "http://localhost:3001/login" })
await mcp_cursor-browser-extension_browser_snapshot()
await mcp_cursor-browser-extension_browser_type({ ref: "email-input", text: "test@example.com" })
await mcp_cursor-browser-extension_browser_type({ ref: "password-input", text: "password123" })
await mcp_cursor-browser-extension_browser_click({ ref: "submit-button", element: "ログインボタン" })
await mcp_cursor-browser-extension_browser_take_screenshot()
```

⸻

## 3. エージェント実行環境（Agent Execution Environment）

### 3.1 基本原則

**エージェントはMCPとCLIを活用して、ほとんどの作業を自動実行できる。**

**重要**: 
- **開発環境**: Cursor内のWebビューアを必ず使用すること（外部ブラウザで開くと制限があり不都合が多いため）
- **UI/UX重視**: ユーザーが実際に使用するため、UI/UX、アニメーション、3Dなどのフロントエンド部分は重要である
- **セキュリティ最優先**: セキュリティは最重要事項（いずれはブロックチェーン技術の導入を予定）

エージェントは以下のツールを組み合わせて、開発・運用・管理タスクを実行します：

### 3.2 MCP経由で実行可能な操作

以下のサービスはMCPサーバー経由で操作可能です（設定済み）：

| サービス | MCPサーバー | 実行可能な操作 |
|---------|------------|---------------|
| **GitHub** | GitHub MCP Server | Issue作成・更新、PR作成・マージ、リポジトリ管理、コード検索 |
| **Supabase** | Supabase MCP Server | データベース管理、プロジェクト作成・管理、マイグレーション、SQL実行、テーブル管理 |
| **Stripe** | Stripe MCP Server | 支払い処理、顧客管理、サブスクリプション管理 |
| **Vercel** | Vercel MCP Server | デプロイ、環境変数管理、ドメイン設定、ログ確認、Cron Jobs管理 |
| **Sentry** | Sentry MCP Server | エラー監視、イベント確認、アラート設定 |
| **Resend** | Resend MCP Server | メール送信、テンプレート管理 |

### 3.3 CLI経由で実行可能な操作

以下のツールはCLI経由で実行可能です：

#### 開発・ビルド

```bash
# 依存関係管理
pnpm install
pnpm add <package>
pnpm remove <package>

# 開発サーバー
pnpm dev

# ビルド
pnpm build

# 型チェック
pnpm typecheck  # tsc --noEmit

# リント・フォーマット
pnpm lint       # eslint
pnpm format     # prettier

# テスト
pnpm test       # vitest
pnpm test:e2e   # playwright test
```

#### データベース操作

**優先**: Supabase MCP Server経由で実行（推奨）

```typescript
// ✅ 推奨: Supabase MCP Server経由
// MCP: supabase.create_project()
// MCP: supabase.list_projects()
// MCP: supabase.push_schema()
// MCP: supabase.execute_sql()
// MCP: supabase.create_migration()
// MCP: supabase.apply_migration()
```

**代替**: Supabase CLI経由（MCP未対応の場合）

```bash
# Supabase CLI（MCP未対応の場合のみ使用）
supabase login
supabase projects list
supabase db push
supabase db remote
supabase db reset
supabase migration new <name>
supabase migration up
```

#### デプロイ・運用

**優先**: MCP Server経由で実行（推奨）

```typescript
// ✅ 推奨: Vercel MCP Server経由
// MCP: vercel.deploy()
// MCP: vercel.get_logs()
// MCP: vercel.manage_env()
// MCP: vercel.manage_domains()
```

**代替**: CLI経由（MCP未対応のツール）

```bash
# Vercel CLI（MCP未対応の場合のみ使用）
vercel login
vercel link
vercel deploy
vercel env pull
vercel logs

# Cloudflare CLI (Wrangler)（CLI経由で実行）
wrangler login
wrangler deploy
wrangler tail
wrangler kv:namespace create
wrangler r2 bucket create

# AI Gateway CLI（CLI経由で実行）
# API経由でAI Gatewayを操作

# Ably CLI（CLI経由で実行）
# API経由でAblyを操作

# Vimeo CLI（CLI経由で実行）
# API経由でVimeoを操作
```

#### バージョン管理・CI

**優先**: GitHub MCP Server経由で実行（推奨）

```typescript
// ✅ 推奨: GitHub MCP Server経由
// MCP: github.create_issue()
// MCP: github.create_pull_request()
// MCP: github.merge_pull_request()
// MCP: github.search_code()
// MCP: github.manage_repository()
```

**代替**: GitHub CLI経由（MCP未対応の場合）

```bash
# GitHub CLI（MCP未対応の場合のみ使用）
gh auth login
gh issue create
gh pr create
gh pr merge
gh repo clone
gh workflow run
```

#### プロジェクト管理

**優先**: MCP Server経由で実行（推奨）

```typescript
// ✅ 推奨: Notion MCP Server経由（将来実装予定）
// MCP: notion.create_page()
// MCP: notion.query_database()
// MCP: notion.append_block()

// ✅ 推奨: Discord MCP Server経由（将来実装予定）
// MCP: discord.send_message()
// MCP: discord.create_channel()
```

**代替**: CLI経由（MCP未対応の場合）

```bash
# Notion CLI (API経由)（MCP未対応の場合のみ使用）
notion pages create
notion databases query
notion blocks append

# Discord CLI (API経由)（MCP未対応の場合のみ使用）
discord send-message
discord create-channel
```

### 3.4 エージェントの作業フロー例

#### 例1: 新機能の実装

```typescript
// 1. Issue作成（GitHub MCP）
// MCP: github.create_issue()

// 2. ブランチ作成・切り替え（Git CLI）
// git checkout -b feature/new-feature

// 3. テスト作成（CLI）
// pnpm test --watch

// 4. 実装・型チェック（CLI）
// pnpm typecheck
// pnpm lint

// 5. データベースマイグレーション（Supabase MCP）
// MCP: supabase.create_migration()
// MCP: supabase.push_schema()

// 6. PR作成（GitHub MCP）
// MCP: github.create_pull_request()

// 7. デプロイ（Vercel MCP）
// MCP: vercel.deploy()
```

#### 例2: エラー監視・対応

```typescript
// 1. エラー確認（Sentry MCP）
// MCP: sentry.get_events()

// 2. ログ確認（Vercel MCP）
// MCP: vercel.get_logs()

// 3. 修正・デプロイ（CLI + MCP）
// pnpm build
// MCP: vercel.deploy()
```

#### 例3: データベース管理

```typescript
// 1. スキーマ変更（Supabase MCP）
// MCP: supabase.create_migration()

// 2. マイグレーション実行（Supabase MCP）
// MCP: supabase.push_schema()

// 3. 本番環境への適用（Supabase MCP）
// MCP: supabase.apply_migration()
// MCP: supabase.execute_sql()
```

### 3.5 エージェント実行時の注意事項

1. **認証情報の管理**
   - 環境変数やMCP設定で認証情報を管理
   - 機密情報はハードコードしない

2. **実行前の確認**
   - 重要な操作（デプロイ、データベース変更など）は実行前に確認
   - テスト環境で先に実行

3. **ログ・監視**
   - すべての操作をログに記録
   - Sentry MCPでエラーを監視

4. **型チェック必須**
   - コード変更後は必ず `pnpm typecheck` を実行
   - 型エラーがある場合は修正してからコミット

5. **TDD原則の遵守**
   - テストを先に書く
   - テストが通ることを確認してからコミット

⸻

## 4. 開発プロセス原則（Development Process Principles）

### 4.1 コア機能優先の開発方針（最重要）

**原則**: 「すべての開発は、コア機能の実装・改善を最優先とする」

Personal Health OS のコア機能は、Beneficiary Platform の4つの機能で構成されています：

#### Beneficiary Platform のコア機能（4つ）

1. **自分カルテ機能** - 薬情報、病院受診情報、疾患情報、検査データ、外部電子カルテ連携（FHIR、SS-MIX2、HL7等）、エクスポート、手動記録
2. **健康計画機能** - リスク予測（1〜10年後）、予防計画（疾患別：内科、精神、神経、血液など）、分析履歴、ビッグデータ分析
3. **チーム&地域包括ケア機能** - 参加中のグループ、すべてのグループ、新規作成、支援事業所検索
4. **マイページ機能** - 通知、設定、プラン管理、外部カルテ連携設定

#### 共通基盤機能

- **電子保存の三原則の実装** - 真正性・見読性・保存性の技術的実装
- **外部カルテ連携基盤** - FHIR、SS-MIX2、HL7、OAuth 2.0/SMART on FHIR認証

**開発判断基準**:
- ✅ コア機能の実装・改善に直接貢献する → **最優先で実装**
- ✅ コア機能を支える基盤機能（電子保存の三原則、RBAC） → **優先的に実装**
- ⚠️ コア機能と無関係な機能 → **コア機能実装後に検討**

### 4.2 TDD & Issue駆動開発（必須）

**原則**: 「コードを書く前に、失敗するテストを書く」

すべての実装は Issue から始める：

1. **Issue の作成**（必須）
   - Why（なぜ必要か）
   - What（何を満たすか）
   - Security / Privacy への影響有無
   - Done 定義（テストが通ること）

2. **テストの作成**（実装前）

   ```typescript
   // ❌ 悪い例: テストなしで実装
   // ✅ 良い例: まず失敗するテストを書く
   describe("HealthDataService", () => {
     it("should aggregate data without exposing raw PII", async () => {
       // テストを先に書く
     });
   });
   ```

3. **実装 → リファクタ**
   - テストが通る最小限の実装
   - リファクタリングで品質向上
   - テストのないコードは **未完成** とみなす

### 4.3 Issue テンプレート

```markdown
## Why（背景・目的）

- なぜこの機能が必要か
- どの問題を解決するか
- **どのコア機能に関連するか**（統合カルテ / AI生活計画 / 習慣化グループ / 基盤機能）

## What（要件）

- 何を実装するか
- 受け入れ条件（AC）

## Core Feature Impact（コア機能への影響）

### Beneficiary Platform
- [ ] 自分カルテ機能への貢献（外部カルテ連携含む）
- [ ] 健康計画機能への貢献（ビッグデータ分析含む）
- [ ] チーム&地域包括ケア機能への貢献
- [ ] マイページ機能への貢献（外部カルテ連携設定含む）

### 共通基盤機能
- [ ] 電子保存の三原則の実装への貢献
- [ ] 外部カルテ連携基盤への貢献

## Security / Privacy Impact

- [ ] 個人情報を扱うか
- [ ] データアクセス権限の変更があるか
- [ ] 外部APIとの連携があるか
- [ ] Compute to Data原則に従っているか（AI機能の場合）

## Done Definition

- [ ] ユニットテストが通る
- [ ] E2Eテストが通る（該当する場合）
- [ ] 型チェックが通る
- [ ] セキュリティレビュー完了
```

⸻

## 5. コーディング規約（Coding Style Guidelines）

### 5.1 TypeScript / TSX（Next.js / Agent）

#### 型安全（最重要）

**原則**: 「型が通らないコードは、存在しないコード」

```typescript
// ❌ 悪い例: any の使用
function processData(data: any) {
  return data.value;
}

// ✅ 良い例: 明示的な型定義
interface HealthData {
  id: string;
  userId: string;
  type: "weight" | "blood_pressure" | "exercise";
  value: number;
  recordedAt: Date;
}

function processData(data: HealthData): number {
  return data.value;
}
```

#### 必須ルール

- `tsconfig.json`: `strict: true` 必須
- `any` 禁止（`unknown` を使用）
- 非同期戻り値は必ず `Promise<T>`
- Props / API / Agent I/O は必ず型定義
- `tsc --noEmit` が常に通る状態を維持

```bash
# CI では型エラー = 即失敗
pnpm typecheck
```

#### Next.js 固有のルール

```typescript
// ✅ Server Component での型安全なデータ取得
import { db } from '@/lib/db';
import { healthData } from '@/lib/schema';

export default async function HealthDataPage() {
  // 型推論が効く
  const data = await db.select().from(healthData);
  return <div>{/* ... */}</div>;
}

// ✅ API Route での型安全なリクエスト/レスポンス
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const createHealthDataSchema = z.object({
  type: z.enum(['weight', 'blood_pressure', 'exercise']),
  value: z.number().positive(),
  recordedAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validated = createHealthDataSchema.parse(body);
  // validated は型安全
}
```

### データベースアクセス（Drizzle ORM）

```typescript
// ✅ 型安全なクエリ
import { db } from "@/lib/db";
import { healthData, users } from "@/lib/schema";
import { eq, and, gte } from "drizzle-orm";

// 型推論が効く
const userData = await db
  .select()
  .from(healthData)
  .where(
    and(eq(healthData.userId, userId), gte(healthData.recordedAt, startDate))
  );
```

⸻

## 6. セキュリティ（Security Considerations）

### 6.1 基本方針

**セキュリティは最優先事項。利便性より安全性を優先。**

- 「後で直す」は禁止
- セキュリティレビューなしのマージは禁止
- 機密情報の直書きは即NG
- **将来実装予定**: ブロックチェーン技術による重要な記録の不変性保証（真正性の強化）

### 機密情報管理

```typescript
// ❌ 悪い例: ハードコード
const API_KEY = "sk_live_1234567890";

// ✅ 良い例: 環境変数
const API_KEY = process.env.STRIPE_SECRET_KEY;
if (!API_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

// ✅ 良い例: サーバーサイドのみ
// app/api/route.ts (Server Component / API Route)
const secret = process.env.SECRET_KEY; // クライアントに露出しない

// ❌ 悪い例: NEXT_PUBLIC_ プレフィックス（機密情報には使用禁止）
const secret = process.env.NEXT_PUBLIC_SECRET_KEY; // クライアントに露出される
```

### データアクセス原則（最重要）

**Raw / 原文 / 個人識別可能データへの直接アクセスは禁止**

```typescript
// ❌ 悪い例: 生データをそのまま返す
export async function GET(request: NextRequest) {
  const rawData = await db.select().from(healthData);
  return NextResponse.json(rawData); // PIIが含まれる可能性
}

// ✅ 良い例: 集計・匿名化・要約のみ
export async function GET(request: NextRequest) {
  // 集計データのみ返す
  const aggregated = await db
    .select({
      type: healthData.type,
      average: sql<number>`avg(${healthData.value})`,
      count: sql<number>`count(*)`,
    })
    .from(healthData)
    .where(eq(healthData.userId, userId))
    .groupBy(healthData.type);

  return NextResponse.json(aggregated);
}

// ✅ 良い例: 統計処理
export async function getHealthStats(userId: string) {
  // 個人を特定できない統計情報のみ
  return {
    averageWeight: 70.5,
    trend: "increasing",
    recommendations: ["..."],
  };
}
```

### データアクセス制御

**原則**: ユーザーは自身のデータのみアクセス可能。外部カルテ連携は本人の明示的同意に基づいてのみ実行される。

```typescript
// ✅ 良い例: ユーザーデータアクセス
import { auth } from '@/lib/auth';

async function getMedicalRecords(userId: string) {
  // 患者は自身のデータのみアクセス可能
  return await db.select()
    .from(medicalRecord)
    .where(eq(medicalRecord.userId, userId));
}

// ✅ 良い例: 外部カルテ連携（本人同意ベース）
async function syncEHRData(userId: string, ehrConnectionId: string) {
  // 本人同意の確認
  const consent = await db.select()
    .from(ehrConsent)
    .where(and(
      eq(ehrConsent.userId, userId),
      eq(ehrConsent.ehrConnectionId, ehrConnectionId),
      eq(ehrConsent.status, 'active')
    ))
    .limit(1);
  
  if (!consent[0]) {
    throw new Error('EHR consent required');
  }
  
  // 外部カルテからデータを取得
  // ...
}

// ✅ 良い例: ルート保護
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  
  // 認証が必要なルート
  if (request.nextUrl.pathname.startsWith('/beneficiary')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}
```

**必須ルール**:
- すべてのAPI Routeでユーザー認証チェックを実装
- データベースクエリにユーザーIDベースのWHERE句を必ず含める
- 外部カルテ連携は本人の明示的同意に基づいてのみ実行
- セッション情報は信頼できるソースから取得し、クライアントから送信された情報は信頼しない

### エージェントに許可される操作

- ✅ 集計（平均、合計、最大、最小など）
- ✅ 要約（データの概要）
- ✅ 匿名化（個人識別情報の除去）
- ✅ 統計処理（傾向分析、パターン認識）
- ❌ Rawデータの取得・表示
- ❌ 個人識別可能情報（PII）の直接アクセス
- ❌ 同意・目的・期間が不明確なデータ取得

### 入力値検証・AI安全

```typescript
import { z } from "zod";

// ✅ すべての入力に型検証・範囲検証
const healthDataSchema = z.object({
  type: z.enum(["weight", "blood_pressure", "exercise"]),
  value: z.number().positive().max(1000), // 範囲検証
  recordedAt: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = healthDataSchema.parse(body);
    // validated は型安全で検証済み
  } catch (error) {
    // 想定外入力は fail-fast
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
```

### Prompt / Tool Injection 対策

```typescript
// ✅ エージェントは勝手に実行しない
// ユーザーの明示的な同意が必要

interface AgentAction {
  action: "analyze" | "suggest" | "export";
  requiresConsent: boolean;
  description: string;
}

// 実行前に確認
async function executeAgentAction(action: AgentAction, userConsent: boolean) {
  if (action.requiresConsent && !userConsent) {
    throw new Error("User consent required");
  }
  // 実行
}
```

### 電子保存の三原則の技術的実装要件

**原則**: すべての医療記録において、真正性・見読性・保存性を技術的に実装し、法的要件を満たす。

#### 1. 真正性（Authenticity）の実装

**技術要件**:
- デジタル署名：すべての医療記録にタイムスタンプ付きデジタル署名を付与
- 改ざん検知：ハッシュ値（SHA-256）による整合性チェック
- 監査ログ：すべてのデータ操作を不変ログに記録

```typescript
// ✅ 良い例: デジタル署名付きレコード作成
import { createHash } from 'crypto';
import { sign } from 'jsonwebtoken';

interface MedicalRecord {
  id: string;
  content: string;
  createdAt: Date;
  digitalSignature: string;
  hash: string;
}

async function createMedicalRecord(content: string, userId: string) {
  // 1. レコード作成
  const record: MedicalRecord = {
    id: generateId(),
    content,
    createdAt: new Date(),
    digitalSignature: '',
    hash: '',
  };
  
  // 2. ハッシュ値計算（改ざん検知用）
  const hash = createHash('sha256')
    .update(JSON.stringify(record))
    .digest('hex');
  record.hash = hash;
  
  // 3. デジタル署名（タイムスタンプ付き）
  const signature = sign(
    { recordId: record.id, hash, timestamp: Date.now() },
    process.env.DIGITAL_SIGNATURE_SECRET!,
    { expiresIn: '10y' } // 長期保存
  );
  record.digitalSignature = signature;
  
  // 4. データベースに保存
  await db.insert(medicalRecord).values(record);
  
  // 5. 監査ログに記録
  await db.insert(auditLog).values({
    userId,
    action: 'create',
    resourceType: 'medical_record',
    resourceId: record.id,
    details: JSON.stringify({ hash, signature }),
    success: true,
  });
  
  return record;
}

// ✅ 良い例: 整合性チェック
async function verifyMedicalRecord(recordId: string) {
  const record = await db.select()
    .from(medicalRecord)
    .where(eq(medicalRecord.id, recordId))
    .limit(1);
  
  if (!record[0]) {
    throw new Error('Record not found');
  }
  
  // ハッシュ値の再計算と照合
  const currentHash = createHash('sha256')
    .update(JSON.stringify({
      id: record[0].id,
      content: record[0].content,
      createdAt: record[0].createdAt,
    }))
    .digest('hex');
  
  if (currentHash !== record[0].hash) {
    // 改ざん検知
    await db.insert(auditLog).values({
      userId: null,
      action: 'verify',
      resourceType: 'medical_record',
      resourceId: recordId,
      details: JSON.stringify({ 
        expected: record[0].hash, 
        actual: currentHash 
      }),
      success: false,
      errorMessage: 'Hash mismatch - possible tampering',
    });
    throw new Error('Record integrity check failed');
  }
  
  return { valid: true, record: record[0] };
}
```

**実装場所**:
- `lib/services/digital-signature.ts`: デジタル署名サービス（新規作成）
- `lib/services/audit-log.ts`: 監査ログ機能の拡張
- データベーススキーマ：`medical_record`テーブルに`digital_signature`、`hash`カラムを追加

#### 2. 見読性（Readability）の実装

**技術要件**:
- 標準フォーマット：FHIR、SS-MIX2、HL7準拠の形式で保存
- 長期保存形式：PDF/A、XML、JSON（標準化された形式）でのエクスポート
- メタデータ管理：データの意味を保持するメタデータの保存

```typescript
// ✅ 良い例: FHIR形式でのエクスポート
import { fhir } from '@/lib/services/fhir';

async function exportMedicalRecordAsFHIR(recordId: string) {
  const record = await db.select()
    .from(medicalRecord)
    .where(eq(medicalRecord.id, recordId))
    .limit(1);
  
  // FHIR形式に変換
  const fhirResource = fhir.convertToFHIR(record[0]);
  
  // メタデータを含める
  const exportData = {
    resource: fhirResource,
    metadata: {
      format: 'FHIR R4',
      version: '4.0.1',
      exportedAt: new Date().toISOString(),
      exportedBy: userId,
      schemaVersion: '1.0',
    },
  };
  
  return exportData;
}

// ✅ 良い例: 長期保存形式（PDF/A）へのエクスポート
import { exportToPDFA } from '@/lib/services/export';

async function exportToLongTermStorage(recordId: string) {
  const record = await getMedicalRecord(recordId);
  
  // PDF/A形式でエクスポート（長期保存に適した形式）
  const pdfBuffer = await exportToPDFA({
    content: record.content,
    metadata: {
      title: 'Medical Record',
      author: 'Personal Health OS',
      creationDate: record.createdAt,
      digitalSignature: record.digitalSignature,
    },
  });
  
  // Cloudflare R2に保存（長期保存用ストレージ）
  await saveToR2(`long-term-storage/${recordId}.pdf`, pdfBuffer);
  
  return { url: getR2Url(`long-term-storage/${recordId}.pdf`) };
}
```

**実装場所**:
- `lib/services/fhir.ts`: FHIR形式のエクスポート/インポート（既存、拡張）
- `lib/services/ssmix2-parser.ts`: SS-MIX2形式のサポート（既存、拡張）
- `lib/services/export.ts`: 長期保存形式へのエクスポート機能（既存、拡張）

#### 3. 保存性（Preservability）の実装

**技術要件**:
- 冗長化：複数のストレージへのバックアップ
- データ移行計画：将来の技術変更に対応可能な設計
- アクセス制御：長期保存データへの適切なアクセス管理

```typescript
// ✅ 良い例: 冗長化バックアップ
import { backup } from '@/lib/services/backup';

async function backupMedicalRecord(recordId: string) {
  const record = await getMedicalRecord(recordId);
  
  // 1. プライマリストレージ（Supabase）
  await db.insert(medicalRecordBackup).values({
    recordId,
    storageType: 'primary',
    data: JSON.stringify(record),
    backedUpAt: new Date(),
  });
  
  // 2. セカンダリストレージ（Cloudflare R2）
  await backup.saveToR2(`backups/${recordId}.json`, record);
  
  // 3. バックアップメタデータの記録
  await db.insert(backupMetadata).values({
    recordId,
    primaryStorage: 'supabase',
    secondaryStorage: 'cloudflare_r2',
    backupDate: new Date(),
    hash: record.hash,
  });
}

// ✅ 良い例: データ移行計画
import { migrate } from '@/lib/services/data-migration';

async function migrateToNewFormat(recordId: string, targetFormat: string) {
  const record = await getMedicalRecord(recordId);
  
  // 現在のフォーマットを確認
  const currentFormat = record.metadata?.format || 'legacy';
  
  // フォーマット変換
  const migratedRecord = await migrate.convert(record, currentFormat, targetFormat);
  
  // 移行履歴を記録
  await db.insert(migrationHistory).values({
    recordId,
    fromFormat: currentFormat,
    toFormat: targetFormat,
    migratedAt: new Date(),
    migratedBy: userId,
    success: true,
  });
  
  return migratedRecord;
}
```

**実装場所**:
- `lib/services/backup.ts`: バックアップサービス（新規作成）
- `lib/services/data-migration.ts`: データ移行サービス（新規作成）
- データベーススキーマ：`backup_metadata`、`migration_history`テーブルの追加

⸻

## 7. ビルド＆テスト（Build & Test）

### 7.1 ローカル開発

```bash
# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm dev

# 型チェック
pnpm typecheck

# リント
pnpm lint
```

### テスト

#### ユニットテスト（Vitest）

```typescript
// tests/health-data.test.ts
import { describe, it, expect } from "vitest";
import { aggregateHealthData } from "@/lib/services/health-data";

describe("HealthDataService", () => {
  it("should aggregate data without exposing PII", async () => {
    const result = await aggregateHealthData("user-123");
    expect(result).not.toHaveProperty("rawData");
    expect(result).toHaveProperty("statistics");
  });
});
```

```bash
pnpm test
```

#### E2Eテスト（Playwright）

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test("user consent flow", async ({ page }) => {
  await page.goto("/health-data");
  // 同意フローをテスト
  await expect(page.getByText("同意が必要です")).toBeVisible();
  await page.click('button:has-text("同意する")');
  // 権限境界をテスト
});
```

```bash
pnpm test:e2e
```

### CI（必須）

`.github/workflows/ci.yml` で以下を実行：

1. **Lint**: `pnpm lint`
2. **Type Check**: `pnpm typecheck`
3. **Unit Test**: `pnpm test`
4. **E2E Test**: `pnpm test:e2e`
5. **Secret Scan**: GitHub Secret Scanning

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm test:e2e
```

⸻

## 8. 知識＆ライブラリ（Knowledge & Library）

### 8.1 MCP経由でのドキュメント取得（必須）

**記憶・推測は禁止。最新ドキュメントを正とする。**

```typescript
// ✅ 実装前に必ず Context7 MCP Server を使用
// resolve-library-id → get-library-docs

// 例: Drizzle ORM の最新ドキュメントを取得
// MCP: resolve-library-id("drizzle-orm")
// MCP: get-library-docs(libraryId)
```

### ドキュメント参照の優先順位

1. **公式ドキュメント**（最新版）
2. **プロジェクト内ドキュメント**（`docs/` フォルダ）
3. **型定義**（`node_modules/@types/` またはライブラリの型定義）

⸻

## 9. データベース・認証の原則

### 9.1 Supabase + Drizzle の使用

**優先**: Supabase MCP Server経由で操作（推奨）

データベース操作は、Supabase MCP Server経由で実行することを推奨します：

```typescript
// ✅ 推奨: Supabase MCP Server経由
// MCP: supabase.create_project()
// MCP: supabase.push_schema()
// MCP: supabase.execute_sql()
// MCP: supabase.create_migration()
// MCP: supabase.apply_migration()
// MCP: supabase.list_tables()
```

**代替**: Supabase CLI経由（MCP未対応の場合）

MCP Serverが利用できない場合は、Supabase CLI経由で操作します。

```typescript
// ✅ 型安全なスキーマ定義
// lib/schema.ts
import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";

export const healthData = pgTable("health_data", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  value: real("value").notNull(),
  recordedAt: timestamp("recorded_at").notNull(),
});

// ✅ 型推論が効くクエリ
import { db } from "@/lib/db";
import { healthData } from "@/lib/schema";

const data = await db.select().from(healthData);
// data の型は自動推論される
```

### Better Auth での認証

```typescript
// ✅ 認証チェックは必須
import { auth } from '@/lib/auth';

export default async function ProtectedPage() {
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session) {
    redirect('/login');
  }

  // セッション情報は型安全
  return <div>Hello, {session.user.name}</div>;
}
```

⸻

## 10. エージェント設計原則（Agent Principles）

### 10.1 基本原則

1. **エージェントは補助者**
   - 決定権は常に本人
   - エージェントは提案・分析のみ

2. **説明可能性優先**
   - なぜその提案をしたか説明可能
   - データの出所を明示

3. **黙って実行しない**
   - 重要な操作は必ず確認
   - ユーザーの明示的同意が必要

### 実装例

```typescript
// ✅ 良い例: エージェントは提案のみ
interface AgentSuggestion {
  type: "recommendation" | "warning" | "info";
  message: string;
  dataSource: string; // データの出所
  confidence: number; // 信頼度
  requiresConsent: boolean;
}

async function getHealthRecommendations(
  userId: string
): Promise<AgentSuggestion[]> {
  // 集計データのみ使用（Rawデータは使用しない）
  const stats = await getHealthStats(userId);

  return [
    {
      type: "recommendation",
      message: "体重の傾向が増加しています",
      dataSource: "過去30日間の体重データ（集計）",
      confidence: 0.85,
      requiresConsent: false, // 集計データのみなので同意不要
    },
  ];
}

// ❌ 悪い例: エージェントが勝手に実行
async function updateHealthData(userId: string) {
  // ユーザーの同意なしに実行してはいけない
  await db.update(healthData).set({ value: newValue });
}
```

⸻

## 11. 非目標（Non-Goals）

以下の機能は **実装しない**：

- ❌ 医療行為の自動化
- ❌ 診断の確定
- ❌ 同意なきデータ連携
- ❌ 個人識別可能情報の外部共有（同意なし）
- ❌ データの外部送信（本人の明示的同意なし）
- ❌ 広告/販売目的でのデータ利用（目的外利用・主権侵害）
- ❌ 経済・政治的意思決定の自動化（中立性・主権を損ねる）

⸻

## 12. プロジェクト構造

このプロジェクトは **Turborepo モノレポ構造** です。

```
personal-health-os/
├── apps/
│   └── web/              # Next.js アプリケーション（メインアプリ）
│       ├── app/          # Next.js App Router
│       │   ├── api/      # API Routes
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── lib/          # ユーティリティ・サービス
│       │   ├── db.ts     # Drizzle データベース接続
│       │   ├── auth.ts   # Better Auth 設定
│       │   ├── schema.ts # Drizzle スキーマ
│       │   └── utils.ts
│       ├── components/   # Reactコンポーネント
│       │   └── ui/       # アプリ固有のUIコンポーネント
│       ├── hooks/        # React Hooks
│       ├── .env.local    # 環境変数（Gitにコミットしない）
│       ├── .env.example  # 環境変数のテンプレート
│       ├── next.config.js
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── ui/               # 共有UIコンポーネント（shadcn/ui）
│       ├── src/
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   └── index.tsx
│       ├── package.json
│       └── tsconfig.json
├── e2e/                  # E2Eテスト（Playwright）
├── docs/                 # ドキュメント
├── turbo.json            # Turborepo設定
├── pnpm-workspace.yaml   # pnpmワークスペース設定
├── package.json          # ルートパッケージ
├── tsconfig.json         # ルートTypeScript設定
└── AGENTS.md            # このファイル
```

⸻

## 13. チェックリスト

### 13.1 実装前

- [ ] Issue が作成されている
- [ ] Security / Privacy Impact が評価されている
- [ ] テストの設計が完了している

### 実装中

- [ ] 型チェックが通る（`pnpm typecheck`）
- [ ] リントが通る（`pnpm lint`）
- [ ] テストが書かれている（ユニット / E2E）
- [ ] 機密情報がハードコードされていない
- [ ] データアクセスが原則に従っている

### マージ前

- [ ] すべてのテストが通る
- [ ] 型チェックが通る
- [ ] セキュリティレビュー完了
- [ ] プライバシー影響評価完了
- [ ] ドキュメント更新（必要に応じて）

⸻

## 14. 最後に

この `AGENTS.md` は
パーソナルヘルスOSの倫理・安全・開発プロセスを守る憲章である。

**迷ったらこの問いに戻る：**

> 「それは本人の主権を強めるか？」

- **YES** → 進め
- **NO** → 実装しない

⸻

## 参考リンク

- [プロジェクトドキュメント](./docs/)
- [統合ガイド](./docs/integration-guide.md)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Better Auth](https://www.better-auth.com/docs)
- [Supabase](https://supabase.com/docs)
