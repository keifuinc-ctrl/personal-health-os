# Personal Health OS - 開発ロードマップ & 開発手順（初心者向け）

> この1ファイルで、**開発環境セットアップ → 日々の開発手順 → CI/テスト → MVP→β→リリースのロードマップ → デプロイ・公開手順 → 現状スナップショット**までを通しで理解できるようにまとめています。
>
> **特に初心者の方へ**: 「見知らぬユーザーがこのアプリを使えるようになるまで」の流れを、セクション9「デプロイ・公開手順」で詳しく解説しています。
>
> 関連ドキュメント: [VISION.md](./VISION.md)（理念・ビジョン）、[AGENTS.md](./AGENTS.md)（開発ルール/セキュリティ/運用の基本）、[ERROR_HANDLING.md](./ERROR_HANDLING.md)（障害対応手順）

---

## 0. このドキュメントの読み方（最短ルート）

- **今すぐ動かしたい**: 「1. まずはローカルで動かす（10〜20分）」だけでOK
- **CIが落ちた/原因が分からない**: 「5. CI/テスト」「6. トラブルシューティング」
- **次に何を作るべきか**: 「7. ロードマップ（MVP→β→リリース）」「8. 現状スナップショット」
- **ユーザーに使ってもらいたい/デプロイしたい**: 「9. デプロイ・公開手順」を参照

---

## 1. まずはローカルで動かす（10〜20分）

### 1.1 前提（インストール）

- Node.js: 20+
- pnpm: 本リポジトリは `package.json` の `packageManager` に合わせて動かします（現状 `pnpm@8.15.0`）
- Git: 最新

### 1.2 クローン & 依存関係

```bash
git clone https://github.com/keifuinc-ctrl/personal-health-os.git
cd personal-health-os
pnpm install
```

### 1.3 環境変数（最低限）

`apps/web/.env.example` を `apps/web/.env.local` にコピーし、最低限これらを設定します：

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`（例: `http://localhost:3001`）
- `BETTER_AUTH_URL`（例: `http://localhost:3001`）

> 重要: `.env.local` はGitにコミットしません（機密情報を含むため）

### 1.4 開発サーバー起動

```bash
pnpm dev
```

起動したらブラウザで `http://localhost:3001` を開きます。

### 1.5 動作確認（最低限のスモークチェック）

- `/` ホームが表示できる
- `/signup` → `/login` が動く
- ログイン後に `/my-page` が表示できる
- `/medical-record` `/ai-life-plan` `/groups` が表示できる（ログインが必要）

---

## 2. 日々の開発手順（初心者が迷わないための型）

### 2.1 作業前チェック

- `main` を最新にする（pull）
- 変更の目的を1文で説明できる状態にする（Issue推奨。理由は [AGENTS.md](./AGENTS.md)）

### 2.2 実装の基本サイクル（最重要）

1. 小さく変更する（1コミット=1目的）
2. ローカルで確認する
3. コミット & プッシュ
4. CIが通ることを確認

### 2.3 よく使うコマンド

```bash
# 開発
pnpm dev

# 品質チェック
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e

# 本番ビルド
pnpm build
```

---

## 3. 開発環境セットアップ（詳細）

### 3.0 開発環境の基本原則

**重要**:
- **Cursor内のWebビューアを必ず使用**: 外部ブラウザで開くと制限があり不都合が多いため、Cursor内のWebビューアを使用すること
- **UI/UX重視**: ユーザーが実際に使用するため、UI/UX、アニメーション、3Dなどのフロントエンド部分は重要である
- **セキュリティ最優先**: セキュリティは最重要事項（いずれはブロックチェーン技術の導入を予定）

### 3.1 追加で入れておくと便利なもの（任意）

- Supabase CLI（MCPが使えない場合の代替）
- Docker Desktop（DBや周辺ツールをコンテナで扱う場合）
- GitHub CLI（MCPが使えない場合の代替）

### 3.2 MCPの使い方（推奨）

MCPの原則・使える操作は [AGENTS.md](./AGENTS.md) を参照してください（GitHub/Supabase/Vercel/Sentry/Resend/Stripe）。

---

## 4. データベースセットアップ（Supabase + Drizzle）

### 4.1 推奨: Supabase MCPで管理

- プロジェクト作成
- 接続情報（`DATABASE_URL`）の取得
- マイグレーション適用

> 具体的なMCPコマンド例は [AGENTS.md](./AGENTS.md) の「データベース操作」を参照

### 4.2 代替: Supabase CLIで管理（MCPが使えない場合）

```bash
supabase login
supabase projects list
```

---

## 5. CI/テスト（GitHub Actionsで落ちやすい点も含む）

### 5.1 CIで実行されること（基本）

- Lint: `pnpm lint`
- Type Check: `pnpm typecheck`
- Unit Tests: `pnpm test`
- E2E Tests: `pnpm test:e2e`
- Build: `pnpm build`

### 5.2 CIで落ちやすい典型例（チェックリスト）

- **環境変数不足**: `DATABASE_URL` / `BETTER_AUTH_SECRET` など
- **Next.js App Routerの制約**:
  - `useSearchParams()` は `<Suspense>` 境界が必要（ビルドで落ちる）
- **Playwright未導入**: `@playwright/test` が入っていない/ブラウザ未インストール
- **DB接続をビルド時に評価してしまう**: `lib/db.ts` の import 時に例外が発生する

---

## 6. トラブルシューティング（よくある）

### 6.1 ポートが使用中

`3001` が埋まっている場合はプロセスを止めて再起動します。

```bash
# ポートを使用しているプロセスを確認・終了
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
```

### 6.2 ビルドが不安定/キャッシュが悪さをする

```bash
pnpm build
```

それでもおかしい場合は（自己責任で）Next/Turboキャッシュをクリアします。

```bash
# キャッシュのクリア
cd apps/web && rm -rf .next node_modules/.cache .turbo
cd ../.. && rm -rf .turbo node_modules/.cache

# 依存関係の再インストール（完全クリーン）
pnpm store prune
pnpm install --force
```

### 6.3 DB接続エラー

- `.env.local` の `DATABASE_URL` を確認
- VPN/ネットワークの影響がないか確認

### 6.4 EMFILE: too many open files（macOS）

**症状**: 開発サーバー起動時に `Watchpack Error (watcher): Error: EMFILE: too many open files, watch` が大量に発生し、ビルドが失敗する。

**原因**: macOSのファイルディスクリプタ制限（maxfiles）のソフトリミットがデフォルトで256に設定されており、Next.jsのファイルウォッチャーには不十分。

**解決方法**:

```bash
# 1. 現在の制限を確認
launchctl limit maxfiles
# 出力例: maxfiles    256            unlimited

# 2. 現在のシェルセッションで制限を引き上げ
ulimit -n 65536

# 3. 制限を引き上げた状態でサーバーを起動
ulimit -n 65536 && pnpm dev
```

**恒久対策**（管理者権限が必要）:

```bash
# /Library/LaunchDaemons/limit.maxfiles.plist を作成
sudo tee /Library/LaunchDaemons/limit.maxfiles.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
EOF

# 設定を読み込み
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist

# Macを再起動
```

### 6.5 webpack TypeError: Cannot read properties of undefined (reading 'call')

**症状**: ブラウザで `TypeError: Cannot read properties of undefined (reading 'call')` が発生し、ページが表示されない。エラースタックに `auth-client.ts` や `navigation.tsx` が含まれる。

**原因**: 
1. webpackキャッシュに古いコードが残っている
2. `better-auth/react` のクライアントサイドモジュール解決の問題
3. サーバー/クライアント間のハイドレーションミスマッチ

**解決方法**:

```bash
# 1. すべてのNodeプロセスを終了
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "node" 2>/dev/null || true

# 2. キャッシュを完全にクリア
cd apps/web && rm -rf .next node_modules/.cache

# 3. pnpmストアをクリーンアップ
pnpm store prune

# 4. 依存関係を再インストール
cd ../.. && pnpm install --force

# 5. サーバーを再起動
cd apps/web && pnpm dev
```

**根本対策**: `lib/auth-client.ts` で `better-auth/react` を使用せず、直接fetchベースのクライアントを実装する（実装済み）。

### 6.6 Operation not permitted (os error 1)

**症状**: `Failed to read source code from ... Operation not permitted (os error 1)` エラーが発生。

**原因**: 
1. EMFILE問題（6.4参照）の派生
2. macOSのファイルシステム権限問題
3. サンドボックス環境の制限

**解決方法**:

```bash
# 1. Macを再起動（ファイルハンドルをリセット）

# 2. ファイルディスクリプタ制限を引き上げ（6.4参照）
ulimit -n 65536

# 3. node_modulesを完全に再インストール
cd /path/to/project
rm -rf node_modules apps/web/node_modules packages/ui/node_modules
pnpm install --force

# 4. サーバーを起動
cd apps/web && pnpm dev
```

### 6.7 環境変数が読み込まれない

**症状**: `.env.local` に設定した環境変数が `undefined` になる。

**原因**:
1. `.env.local` ファイルのパーミッション問題
2. サンドボックス環境による読み取り制限
3. 環境変数名のタイポ

**解決方法**:

```bash
# 1. ファイルの存在とパーミッションを確認
ls -la apps/web/.env.local

# 2. パーミッションを修正
chmod 644 apps/web/.env.local

# 3. サーバーを再起動
cd apps/web && pnpm dev
```

**注意**: `NEXT_PUBLIC_` プレフィックスがない環境変数はサーバーサイドでのみ利用可能です。クライアントサイドで使用する場合は `NEXT_PUBLIC_` を付けてください（ただし機密情報には使用禁止）。

---

## 7. ロードマップ（MVP→β→リリース）

### 7.1 フェーズ定義

- **MVP**: 最小価値を提供できる（10〜50人規模で使える）
- **β**: 早期ユーザーのフィードバックを回収し、安定性/UXを磨く（50〜500人）
- **リリース**: 一般公開し、運用しながら拡張する

---

## 🎯 MVP（Minimum Viable Product）フェーズ

### フェーズの目的

**Beneficiary Platform のコア機能が動作し、外部電子カルテシステムと連携しながら、患者中心の医療・個別化医療・予防医療・遠隔医療・ビッグデータ分析を実現できる状態**を目指します。

### 開発タスク（チェックリスト）

#### 1. プラットフォーム基盤の構築（最優先）

**1.1 認証・認可基盤の実装**

- [x] **ユーザー認証**
  - [x] サインアップ/ログイン/ログアウト
  - [ ] メール認証

- [ ] **外部カルテ連携認証**
  - [ ] OAuth 2.0認証の実装
  - [ ] SMART on FHIR認証のサポート
  - [ ] 連携先医療機関の管理機能

#### 2. Beneficiary Platform コア機能の完成（最優先）

**2.1 自分カルテ機能**

- [ ] **外部電子カルテ連携（最重要）**
  - [ ] FHIR R4対応（FHIR Client実装）
  - [ ] SS-MIX2形式のインポート/エクスポート
  - [ ] HL7形式のサポート
  - [ ] OAuth 2.0 / SMART on FHIR認証
  - [ ] 複数医療機関からのデータ取得
  - [ ] 自動データ同期機能（定期バッチ or リアルタイム）
  - [ ] データ連携履歴の管理（`ehr_sync_log`テーブル）
  - [ ] 連携先医療機関の管理（`external_ehr_connection`テーブル）

- [x] **薬情報の記録・管理**（既存機能拡充）
  - [x] 薬情報の記録フォーム
  - [x] 薬情報の一覧表示
  - [x] 薬情報の編集・削除
  - [x] 薬情報の検索・フィルター機能
  - [x] 薬情報のエクスポート（CSV）
  - [ ] 外部カルテからの薬情報自動同期

- [x] **病院受診情報の記録・管理**（既存機能拡充）
  - [x] 病院受診情報の記録フォーム（診療記録として実装済み）
  - [x] 病院受診情報の一覧表示（診療記録として実装済み）
  - [x] 病院受診情報の編集・削除（診療記録として実装済み）
  - [x] 病院受診情報の検索・フィルター機能
  - [ ] 外部カルテからの受診履歴自動同期

- [x] **疾患情報の記録・管理**（既存機能拡充）
  - [x] 疾患情報の記録フォーム（診療記録として実装済み）
  - [x] 疾患情報の一覧表示（診療記録として実装済み）
  - [x] 疾患情報の編集・削除（診療記録として実装済み）
  - [x] 疾患情報の検索・フィルター機能
  - [ ] 外部カルテからの疾患情報自動同期

- [x] **検査データの記録・管理**（既存機能拡充）
  - [x] 検査データの記録フォーム
  - [x] 検査データの一覧表示
  - [x] 検査データの編集・削除
  - [x] 検査データの検索・フィルター機能
  - [ ] 検査データのグラフ表示
  - [ ] 外部カルテからの検査データ自動同期

- [ ] **エクスポート機能**
  - [x] CSV形式エクスポート（薬情報、検査結果、診療記録）
  - [ ] FHIR形式エクスポート
  - [ ] SS-MIX2形式エクスポート
  - [ ] PDF/A形式エクスポート

**2.2 健康計画機能**（既存機能拡充）

- [x] **健康データの記録・表示**
- [ ] **データ集計処理**（異常値検出/統計分析含む）
- [ ] **リスク予測（基本）**
- [ ] **予防計画・運動計画（基本）**
- [ ] **分析履歴**
- [x] **AI分析エンジン連携**
  - [x] AI Gateway連携（環境変数設定は手動作業 - 下記手順書参照）
  - [x] `lib/services/ai-gateway.ts` の作成
  - [x] `lib/services/ai-analysis.ts` の作成
  - [ ] リトライ/失敗時のUX
- [ ] **リスク予測の精度向上**
  - [ ] 外部カルテデータを活用した精度向上
  - [ ] 1〜10年後のリスク予測の実装
  - [ ] 様々な疾患やADLのリスク表示
- [ ] **予防計画の詳細化**
  - [ ] 疾患別プラン（内科、精神、神経、血液など）の実装
  - [ ] 個別化された推奨事項の生成
- [ ] **ビッグデータ分析機能**
  - [ ] 集約データによるアウトカム分析
  - [ ] 匿名化データによる統計分析（ユーザー同意ベース）

**2.3 チーム&地域包括ケア機能**（既存機能を維持）

- [ ] **グループ作成・参加**（招待制含む）
- [ ] **投稿**
- [ ] **検索・フィルター・ソート**
- [x] **AIマッチング（基本実装）**（集計データベースのマッチングアルゴリズム）
  - [x] AI Gateway連携（環境変数設定は手動作業 - 下記手順書参照）
  - [x] `lib/services/group.ts` の作成（マッチングアルゴリズム実装）
- [ ] **支援事業所検索機能**
  - [ ] 支援事業所データベースの構築（介護施設、居宅介護支援、地域包括、デイサービス、訪問看護、訪問介護、相談支援事業、放課後デイ、共同生活援助、老人ホーム等）（`care_facility`テーブル）
  - [ ] 基本情報（年齢、住所など）を元にしたマッチング機能（`/api/beneficiary/care-facilities`）
  - [ ] マッチング結果の表示・保存（`facility_match`テーブル、`/beneficiary/care-facilities`ページ）

**2.4 マイページ機能**（既存機能拡充）

- [ ] **通知機能**（既存の`notification`テーブルを活用）
- [ ] **設定機能**（既存の`user_setting`テーブルを活用）
- [ ] **外部カルテ連携設定**
  - [ ] 連携先医療機関の追加・削除
  - [ ] 連携設定（同期頻度、同期項目等）
  - [ ] 連携状態の確認
- [ ] **プラン管理**（既存の`subscription`テーブルを活用）

#### 3. 遠隔医療・mHealth対応（新規追加）

- [ ] **ウェアラブルデバイス連携**
  - [ ] Apple Health連携
  - [ ] Google Fit連携
  - [ ] Fitbit連携
  - [ ] その他主要ウェアラブルデバイス連携
- [ ] **モバイルアプリ対応**
  - [ ] レスポンシブデザインの最適化
  - [ ] PWA（Progressive Web App）対応
  - [ ] プッシュ通知対応

#### 4. 電子保存の三原則の実装（最優先）

**4.1 真正性（Authenticity）の実装**

- [ ] **デジタル署名機能**
  - [ ] `lib/services/digital-signature.ts` の作成
  - [ ] すべての医療記録にタイムスタンプ付きデジタル署名を付与
  - [ ] デジタル署名の検証機能（`verifySignedRecord`関数）

- [ ] **改ざん検知機能**
  - [ ] ハッシュ値（SHA-256）による整合性チェック（`calculateHash`関数）
  - [ ] データベーススキーマに`hash`カラムの追加
  - [ ] 整合性チェック機能の実装（`batchIntegrityCheck`関数）

- [x] **監査ログ機能の拡張**
  - [x] `lib/services/audit-log.ts` の実装（`logSuccess`, `logFailure`関数実装済み）
  - [x] すべてのデータ操作を不変ログに記録（API Routesで実装済み）
  - [ ] `audit_log`テーブルの拡張（デジタル署名情報、ハッシュ値の記録）

**4.2 見読性（Readability）の実装**

- [ ] **標準フォーマット対応の拡充**
  - [ ] `lib/services/fhir.ts` の拡張（FHIR形式のエクスポート/インポート強化）
  - [ ] `lib/services/ssmix2-parser.ts` の拡張（SS-MIX2形式のサポート強化）
  - [ ] HL7形式のサポート追加

- [ ] **長期保存形式へのエクスポート**
  - [x] `lib/services/export.ts` の作成（CSV形式エクスポート実装済み）
  - [ ] PDF/A形式でのエクスポート機能（外部ライブラリ統合が必要）
  - [ ] XML、JSON（標準化された形式）でのエクスポート機能

- [ ] **メタデータ管理**
  - [ ] データの意味を保持するメタデータの保存機能（`format`, `schemaVersion`カラム）
  - [ ] バージョン管理機能（フォーマット変更時の互換性維持）

**4.3 保存性（Preservability）の実装**

- [ ] **バックアップ機能**
  - [ ] `lib/services/backup.ts` の作成
  - [ ] 複数のストレージへのバックアップ（Supabase、Cloudflare R2）
  - [ ] バックアップメタデータテーブルの作成（`backup_metadata`）

- [ ] **データ移行機能**
  - [ ] `lib/services/data-migration.ts` の作成
  - [ ] 将来の技術変更に対応可能な設計
  - [ ] 移行履歴テーブルの作成（`migration_history`）

- [ ] **データ整合性チェック**
  - [ ] 定期的なデータ検証機能（ハッシュ値の照合、破損検知）（`verifyBackupIntegrity`関数）
  - [ ] 自動整合性チェックのスケジューリング（Cronジョブ設定が必要）

#### 5. 認証・セキュリティ（最重要）

**注意**: セキュリティは最重要事項。いずれはブロックチェーン技術の導入を予定。

- [x] サインアップ/ログイン/ログアウト
- [ ] メール認証（Resend）（環境変数設定は手動作業 - 下記手順書参照）
- [ ] レート制限/CSRFなど（必要最小限から）
- [ ] データ暗号化（通信・保存時）
- [x] 監査ログ（すべてのデータアクセスを記録）
- [ ] ブロックチェーン技術の検討（将来実装：重要な記録の不変性保証）

#### 6. UI/UX（重要）

**注意**: ユーザーが実際に使用するため、UI/UX、アニメーション、3Dなどのフロントエンド部分は重要である。

- [x] ナビゲーション/フッター/レスポンシブ
- [x] ローディング表示（各ページにloading.tsx実装）
- [ ] エラー表示/アクセシビリティ
- [x] Beneficiary Platform 専用UI（`/beneficiary/*`ページ群）
- [x] アニメーション/トランジション効果（framer-motion使用）
- [ ] 3D要素（必要に応じて）
- [ ] ユーザビリティテスト

#### 7. CI/CD・運用の最小セット

- [x] GitHub Actions（lint/typecheck/test/e2e/build）
- [ ] 基本ログ

---

## 🧪 β（ベータ）フェーズ

（このセクション以下は、現行ドキュメントのチェックリストを維持しつつ、必要に応じて更新します）

### フェーズの目的

限定ユーザーで使ってもらい、フィードバックに基づいて安定性/UX/セキュリティを強化します。

### 開発タスク

#### 1. フィードバックに基づく改善

- [ ] フィードバック収集（フォーム/アンケート）（`/feedback`ページ、`/api/feedback`API）
- [ ] UI/UX改善（体感速度/導線/文言）- フィードバック収集後に対応
- [ ] 要望の高い機能改善 - フィードバック収集後に対応

#### 2. パフォーマンス最適化

- [ ] フロントエンド最適化
- [ ] DB/API最適化（インデックス・クエリ）
- [ ] 電子保存の三原則実装によるパフォーマンス影響の最適化
- [ ] 外部カルテ連携のパフォーマンス最適化

#### 3. セキュリティ強化

- [ ] 監査ログ/アクセスログ（`audit_log`テーブル、`/api/audit-logs`API）
- [ ] 脆弱性スキャン/パッチ適用（`.github/dependabot.yml`設定済み）
- [ ] 電子保存の三原則の完全実装
  - [ ] デジタル署名の本番環境対応
  - [ ] 改ざん検知の定期実行
  - [ ] 長期保存形式への移行完了

#### 4. 決済（Stripe）

- [ ] サブスク決済/更新/キャンセル/Webhook（`/pricing`ページ、`/api/stripe/*`API）
  - 環境変数設定が必要: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

#### 5. 外部電子カルテ連携の拡充

- [ ] FHIR / SS-MIX2 / HL7対応（`lib/services/fhir.ts`）
- [ ] OAuth 2.0 / SMART on FHIR（SMARTAuthHelper実装）
- [ ] 本人同意管理（拡充）（`/api/consent/history`API追加）
- [ ] 複数医療機関からのデータ統合
- [ ] リアルタイムデータ同期機能
- [ ] データ連携エラーハンドリングとリトライ機能

---

## 🚀 リリース（本番）フェーズ

### フェーズの目的

リリースフェーズでは、**一般公開し、継続的に改善・拡張していく**ことを目指します。

### 開発タスク

#### 1. スケーラビリティ対応

- [ ] インフラのスケーリング（Vercel、Supabase）
- [ ] データベースのスケーリング
- [ ] キャッシュ戦略の最適化

#### 2. 高度な機能の追加

- [ ] 多言語対応
- [ ] データバックアップ・復元機能（ユーザー向け）
- [ ] モバイルアプリ（将来）

#### 3. 継続的な機能改善

- [ ] ユーザーフィードバックに基づく改善
- [ ] 新機能の追加

### 運営保守タスク

#### 1. 24/7監視体制

- [ ] 監視体制の構築
- [ ] 監視ダッシュボードの構築

#### 2. インシデント対応

- [ ] インシデント対応体制の構築
- [ ] インシデント管理

#### 3. 定期メンテナンス

- [ ] 定期メンテナンスの実施
- [ ] メンテナンス計画の策定

#### 4. コンプライアンス対応

- [ ] 個人情報保護法対応
- [ ] 医療情報の取り扱い

#### 5. ユーザーサポートの拡充

- [ ] サポート体制の拡充
- [ ] サポートツールの導入

---

## 8. 現状スナップショット（開発の現在地）

> 目的: 「今どこまで出来ていて、次に何を埋めるか」を初心者が俯瞰できる状態にする

### 8.1 コア機能の進捗（目安）

#### Beneficiary Platform
- 自分カルテ: 40%（基本CRUD実装済み、検索/インポート/エクスポート、外部カルテ連携が未実装）
- 健康計画: 10%（健康データ記録・表示実装済み、集計/履歴、リスク予測、予防計画、ビッグデータ分析が未実装）
- チーム&地域包括ケア: 5%（プレースホルダーページ実装済み、招待制/検索/投稿、支援事業所検索機能が未実装）
- マイページ: 5%（プレースホルダーページ実装済み、通知/設定/プラン管理、外部カルテ連携設定が未実装）

#### 共通基盤機能
- 電子保存の三原則: 10%（監査ログ実装済み、デジタル署名、改ざん検知、長期保存形式、バックアップ、データ移行が未実装）
- 外部カルテ連携基盤: 0%（FHIR、SS-MIX2、HL7、OAuth 2.0/SMART on FHIRが未実装）

### 8.2 現時点の画面構成（要約）

#### ホーム画面
- 機能紹介カード → 各ページ遷移

#### Beneficiary Platform（実装予定）
- マイページ: 通知/設定/プラン/外部カルテ連携設定
- 健康計画: 実行内容（健康データ）/リスク/予防/運動/履歴/ビッグデータ分析
- 自分カルテ: 薬/病院/疾患/検査（＋外部カルテ連携/インポート/エクスポート導線）
- チーム: 参加中/全て/マッチング（招待制・検索/フィルタ/ソート）

---

## 9. デプロイ・公開手順（初心者向け）

> **このセクションの目的**: 「見知らぬユーザーがこのアプリを使えるようになるまで」の流れを初心者にも分かりやすく解説します。

### 9.1 デプロイとは何か？

**デプロイ（Deploy）**とは、あなたのパソコン（ローカル環境）で動いているアプリを、インターネット上に公開して、誰でもアクセスできるようにすることです。

#### 開発環境と本番環境の違い

| 項目 | 開発環境（ローカル） | 本番環境（公開） |
|------|-------------------|-----------------|
| **場所** | あなたのパソコン | クラウドサーバー（Vercel等） |
| **URL** | `http://localhost:3001` | `https://your-app.vercel.app` |
| **アクセス** | あなただけ | 世界中の誰でも |
| **データベース** | 開発用（テストデータ） | 本番用（実際のユーザーデータ） |
| **目的** | 開発・テスト | 実際のユーザーが使う |

#### なぜデプロイが必要か？

- **ユーザーが使えるようにする**: ローカル環境では、あなたのパソコンでしか動きません
- **24時間365日動かす**: あなたのパソコンを常に起動しておく必要がなくなります
- **スケールする**: 多くのユーザーが同時にアクセスしても対応できます

### 9.2 デプロイ前の準備チェックリスト

デプロイする前に、以下を確認してください：

#### ✅ 必須チェック項目

- [ ] **ローカルで動作確認済み**
  - `pnpm dev` で正常に動作する
  - 主要な機能（サインアップ、ログイン、データ記録等）が動作する
- [ ] **ビルドが成功する**
  - `pnpm build` がエラーなく完了する
- [ ] **テストが通る**
  - `pnpm test` が通る
  - `pnpm test:e2e` が通る（可能な範囲で）
- [ ] **環境変数の準備**
  - 本番環境用の環境変数をリストアップ済み
  - 外部サービスのAPIキーを取得済み

#### 📋 本番環境用の環境変数リスト

以下の環境変数を本番環境（Vercel）に設定する必要があります：

**必須（最低限）:**
- `DATABASE_URL` - 本番データベースの接続URL
- `BETTER_AUTH_SECRET` - 認証用の秘密鍵（ランダムな文字列）
- `BETTER_AUTH_URL` - 本番環境のURL（例: `https://your-app.vercel.app`）
- `NEXT_PUBLIC_APP_URL` - 本番環境のURL（例: `https://your-app.vercel.app`）

**推奨（機能を有効化する場合）:**
- `RESEND_API_KEY` - メール送信機能（Resend）
- `RESEND_FROM_EMAIL` - 送信元メールアドレス
- `STRIPE_SECRET_KEY` - 決済機能（Stripe）
- `STRIPE_PUBLISHABLE_KEY` - 決済機能（Stripe）
- `STRIPE_WEBHOOK_SECRET` - 決済機能（Stripe Webhook）
- `CLOUDFLARE_ACCOUNT_ID` - AI Gateway連携（Cloudflare）
- `CLOUDFLARE_API_TOKEN` - AI Gateway連携（Cloudflare、オプション）

**監視・分析:**
- `SENTRY_DSN` - エラー監視（Sentry）
- `NEXT_PUBLIC_VERCEL_ANALYTICS_ID` - アクセス解析（Vercel Analytics）

### 9.3 Vercelへのデプロイ手順（詳細）

Vercelは、Next.jsアプリを簡単にデプロイできるサービスです。無料プランでも利用可能です。

#### ステップ1: Vercelアカウントの作成

1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. GitHubアカウントでログイン（推奨）またはメールアドレスで登録
4. メールアドレスを確認（確認メールが届きます）

#### ステップ2: GitHubリポジトリの準備

**重要**: Vercelにデプロイするには、コードがGitHubにプッシュされている必要があります。

1. GitHubにリポジトリが存在することを確認
2. 最新のコードがプッシュされていることを確認
   ```bash
   git status
   git push origin main
   ```

#### ステップ3: Vercelプロジェクトの作成

**方法A: Vercelダッシュボードから作成（推奨）**

1. Vercelダッシュボードにログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択（`personal-health-os`）
4. プロジェクト設定:
   - **Framework Preset**: Next.js（自動検出される）
   - **Root Directory**: `apps/web`（モノレポの場合）
   - **Build Command**: `pnpm build`（自動設定される）
   - **Output Directory**: `.next`（自動設定される）
   - **Install Command**: `pnpm install`（自動設定される）
5. 「Deploy」をクリック

**方法B: Vercel CLIから作成**

```bash
# Vercel CLIをインストール（初回のみ）
pnpm add -g vercel

# プロジェクトにログイン
vercel login

# プロジェクトディレクトリに移動
cd apps/web

# デプロイ
vercel
```

#### ステップ4: 環境変数の設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Environment Variables」をクリック
3. 以下の環境変数を追加（「Add New」ボタンから）:

**必須環境変数:**
```
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**推奨環境変数（機能を有効化する場合）:**
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
```

**重要**: 
- 環境変数を追加した後、**「Redeploy」をクリック**して再デプロイする必要があります
- `NEXT_PUBLIC_*` で始まる環境変数は、ブラウザ側でも使用されるため、機密情報には使用しないでください

#### ステップ5: データベースの準備（Supabase）

本番環境用のデータベースを準備します。

**方法A: Supabase MCP Server経由（推奨）**

1. Supabase MCP Serverを使用して本番プロジェクトを作成
2. 接続情報（`DATABASE_URL`）を取得
3. Vercelの環境変数に設定

**方法B: Supabaseダッシュボードから作成**

1. https://supabase.com にアクセス
2. 「New Project」をクリック
3. プロジェクト情報を入力:
   - **Name**: `personal-health-os-production`
   - **Database Password**: 強力なパスワードを設定（忘れないように！）
   - **Region**: 最寄りのリージョンを選択
4. 「Create new project」をクリック
5. プロジェクト作成完了後、「Settings」→「Database」から接続情報を取得
6. `DATABASE_URL` の形式:
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   ```
7. この `DATABASE_URL` をVercelの環境変数に設定

**データベースマイグレーションの適用:**

本番データベースにスキーマを適用します：

```bash
# 本番データベースのURLを環境変数に設定
export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# マイグレーションを適用
cd apps/web
pnpm db:push
```

または、Supabase MCP Server経由で実行（推奨）。

#### ステップ6: デプロイの実行

1. Vercelダッシュボードで「Deployments」タブを開く
2. 最新のデプロイメントを確認
3. デプロイが成功すると、URLが表示されます（例: `https://your-app.vercel.app`）

**自動デプロイの設定:**

GitHubリポジトリと連携している場合、`main`ブランチにプッシュすると自動的にデプロイされます。

#### ステップ7: デプロイ後の確認

デプロイが完了したら、以下を確認してください：

1. **URLにアクセス**
   - `https://your-app.vercel.app` にアクセス
   - ホームページが表示されることを確認

2. **基本機能の動作確認**
   - [ ] サインアップができる
   - [ ] ログインができる
   - [ ] データの記録ができる
   - [ ] データの表示ができる

3. **エラーの確認**
   - Vercelダッシュボードの「Logs」タブでエラーがないか確認
   - Sentryダッシュボードでエラーがないか確認（設定済みの場合）

### 9.4 ドメイン設定（オプション）

カスタムドメイン（例: `https://personal-health-os.com`）を使用する場合の手順です。

#### ステップ1: ドメインの取得

1. ドメイン登録サービス（例: Google Domains、Namecheap、お名前.com）でドメインを購入
2. 購入したドメインを確認

#### ステップ2: Vercelでドメインを設定

1. Vercelダッシュボードでプロジェクトを開く
2. 「Settings」→「Domains」をクリック
3. ドメインを入力（例: `personal-health-os.com`）
4. 「Add」をクリック
5. 表示されたDNS設定をコピー

#### ステップ3: DNS設定

1. ドメイン登録サービスの管理画面にログイン
2. DNS設定を開く
3. VercelからコピーしたDNS設定を追加:
   - **Type**: `A` または `CNAME`
   - **Name**: `@` または `www`
   - **Value**: Vercelから提供された値
4. 設定を保存

**注意**: DNS設定の反映には数時間かかる場合があります。

### 9.5 本番環境での動作確認チェックリスト

デプロイ後、以下のチェックリストで動作確認を行います：

#### ✅ 認証機能

- [ ] サインアップができる
- [ ] メール認証が動作する（Resend設定済みの場合）
- [ ] ログインができる
- [ ] ログアウトができる
- [ ] パスワードリセットが動作する

#### ✅ コア機能

- [ ] 健康データの記録ができる
- [ ] 薬情報の記録ができる
- [ ] 病院受診情報の記録ができる
- [ ] 疾患情報の記録ができる
- [ ] 検査データの記録ができる
- [ ] データの表示・編集・削除ができる

#### ✅ AI機能

- [ ] AI分析が動作する（AI Gateway設定済みの場合）
- [ ] グループマッチングが動作する

#### ✅ その他の機能

- [ ] データのインポート・エクスポートができる
- [ ] フィードバック送信ができる（βフェーズ）
- [ ] 決済が動作する（Stripe設定済みの場合）

#### ✅ エラー監視

- [ ] Sentryでエラーが記録されているか確認
- [ ] Vercel Analyticsでアクセスが記録されているか確認

### 9.6 ユーザーが使える状態になるまで

#### MVPフェーズ完了時の状態

**完了条件:**
- ✅ 3つのコア機能が動作する
- ✅ 基本的な認証・セキュリティが実装されている
- ✅ ローカル環境で動作確認が完了している
- ✅ CI/CDパイプラインが動作している
- ✅ **デプロイ可能な状態になっている**

**ユーザーが使える状態:**
- デプロイが完了し、URLが公開されている
- サインアップ・ログインができる
- 基本的な機能（データ記録・表示）が使える
- **10〜50人程度のテストユーザーが使える状態**

**次のステップ:**
- テストユーザーを募集
- フィードバックを収集
- βフェーズの準備

#### βフェーズ完了時の状態

**完了条件:**
- ✅ フィードバック収集機能が動作する
- ✅ パフォーマンス最適化が完了している
- ✅ セキュリティ強化が完了している
- ✅ 決済機能が動作する（オプション）
- ✅ 電子カルテ連携の基盤が整っている
- ✅ **本番環境で50-500人のユーザーが使える状態になっている**

**ユーザーが使える状態:**
- 本番環境で安定して動作している
- フィードバックを収集できる
- 決済機能が使える（有料プランがある場合）
- **50〜500人程度のユーザーが使える状態**

**次のステップ:**
- ユーザーフィードバックに基づく改善
- リリースフェーズの準備

#### リリースフェーズ完了時の状態

**完了条件:**
- ✅ スケーラビリティ対応が完了している
- ✅ 24/7監視体制が整っている
- ✅ インシデント対応体制が整っている
- ✅ コンプライアンス対応が完了している
- ✅ **一般公開できる状態になっている**

**ユーザーが使える状態:**
- 誰でもアクセスして使える
- 大規模なユーザー数に対応できる
- 安定して動作している
- **無制限のユーザーが使える状態**

### 9.7 よくある問題と解決方法

#### 問題1: デプロイが失敗する

**原因:**
- ビルドエラー
- 環境変数が不足している
- 依存関係の問題

**解決方法:**
1. Vercelダッシュボードの「Logs」タブでエラーを確認
2. ローカルで `pnpm build` を実行してエラーを確認
3. 環境変数が正しく設定されているか確認
4. `package.json` の依存関係を確認

#### 問題2: データベース接続エラー

**原因:**
- `DATABASE_URL` が正しく設定されていない
- データベースのファイアウォール設定

**解決方法:**
1. Vercelの環境変数で `DATABASE_URL` を確認
2. Supabaseダッシュボードで接続設定を確認
3. 必要に応じて、Supabaseの「Settings」→「Database」→「Connection Pooling」を確認

#### 問題3: メールが送信されない

**原因:**
- `RESEND_API_KEY` が設定されていない
- `RESEND_FROM_EMAIL` が正しく設定されていない

**解決方法:**
1. Vercelの環境変数で `RESEND_API_KEY` を確認
2. ResendダッシュボードでAPIキーが有効か確認
3. ドメイン検証が必要な場合は、Resendダッシュボードでドメインを検証

#### 問題4: 決済が動作しない

**原因:**
- Stripeの環境変数が設定されていない
- Webhook URLが正しく設定されていない

**解決方法:**
1. Vercelの環境変数で `STRIPE_SECRET_KEY` を確認
2. StripeダッシュボードでWebhook URLを設定:
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - イベント: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`

---

## ✅ 各フェーズのチェックリスト

### MVPフェーズのチェックリスト

#### 開発タスク

- [x] **コア機能の完成**
  - [x] 統合カルテ機能（薬、病院、疾患、検査データの記録・管理）（基本CRUD実装済み）
  - [ ] AI生活計画機能（健康データ記録、リスク予測、予防計画、運動計画）（健康データ記録のみ実装済み）
  - [ ] 習慣化グループ機能（グループ作成・参加、投稿、検索・フィルター）

- [x] **認証・セキュリティ（基本）**
  - [x] ユーザー認証（サインアップ、ログイン、ログアウト）
  - [ ] パスワードリセット
  - [x] 入力値検証（Zodスキーマ実装済み）
  - [x] 基本的なセキュリティ対策（監査ログ実装済み）

- [x] **UI/UX（最小限）**
  - [x] 基本レイアウト（ナビゲーション、フッター）
  - [x] レスポンシブデザイン
  - [ ] 基本的なアクセシビリティ

- [x] **データベース・インフラ（基本）**
  - [x] データベーススキーマの完成
  - [x] CI/CDパイプラインの構築

#### 運営保守タスク

- [ ] **監視・ログ（基本）**
  - [ ] エラー監視（Sentry）
  - [ ] アクセス解析（Vercel Analytics）
  - [ ] 基本的なログ管理

- [ ] **エラー対応**
  - [ ] エラー対応フローの確立
  - [ ] エラー対応手順書の作成

- [ ] **ユーザーサポート準備**
  - [ ] お問い合わせフォームの作成
  - [ ] よくある質問（FAQ）の作成

### βフェーズのチェックリスト

#### 開発タスク

- [ ] **フィードバックに基づく改善**
  - [ ] フィードバック収集機能の実装
  - [ ] UI/UXの改善
  - [ ] 機能の追加・改善

- [ ] **パフォーマンス最適化**
  - [ ] フロントエンド最適化
  - [ ] バックエンド最適化
  - [ ] スケーラビリティ対応（準備）

- [ ] **セキュリティ強化**
  - [ ] セキュリティ監査の実施
  - [ ] 個人情報保護の強化

- [ ] **決済機能の実装**
  - [ ] Stripe決済連携
  - [ ] サブスクリプション管理

- [ ] **電子カルテ連携機能の拡充**
  - [ ] FHIR対応
  - [ ] SS-MIX2対応
  - [ ] レセプト電算対応

- [x] **AI Gateway連携の完成**
  - [x] AI Gateway API連携（`lib/services/ai-gateway.ts`）
  - [x] AI分析エンジンとの連携（`lib/services/ai-analysis.ts`）

#### 運営保守タスク

- [ ] **本格的な監視・アラート設定**
  - [ ] 監視体制の構築
  - [ ] アラート設定

- [ ] **ユーザーサポート体制の構築**
  - [ ] サポートチケットシステムの導入
  - [ ] サポート対応フローの確立
  - [ ] ドキュメント整備

- [ ] **データバックアップ・復元**
  - [ ] バックアップ体制の構築
  - [ ] 復元テストの実施

- [ ] **セキュリティ監査**
  - [ ] 外部セキュリティ監査の実施
  - [ ] 脆弱性スキャンの定期実施

- [ ] **パフォーマンステスト**
  - [ ] 負荷テストの実施

### リリースフェーズのチェックリスト

#### 開発タスク

- [ ] **スケーラビリティ対応**
  - [ ] インフラのスケーリング
  - [ ] データベースのスケーリング
  - [ ] キャッシュ戦略の最適化

- [ ] **高度な機能の追加**
  - [ ] 多言語対応
  - [ ] データバックアップ・復元機能（ユーザー向け）
  - [ ] モバイルアプリ（将来）

- [ ] **継続的な機能改善**
  - [ ] ユーザーフィードバックに基づく改善
  - [ ] 新機能の追加

#### 運営保守タスク

- [ ] **24/7監視体制**
  - [ ] 監視体制の構築
  - [ ] 監視ダッシュボードの構築

- [ ] **インシデント対応**
  - [ ] インシデント対応体制の構築
  - [ ] インシデント管理

- [ ] **定期メンテナンス**
  - [ ] 定期メンテナンスの実施
  - [ ] メンテナンス計画の策定

- [ ] **コンプライアンス対応**
  - [ ] 個人情報保護法対応
  - [ ] 医療情報の取り扱い

- [ ] **ユーザーサポートの拡充**
  - [ ] サポート体制の拡充
  - [ ] サポートツールの導入

---

## ❓ よくある質問（FAQ）

### MVPフェーズについて

**Q: MVPはいつまでに完成させるべきですか？**

A: 通常、MVPは**3〜6ヶ月**で完成させることを目指します。ただし、チームの規模やリソースによって異なります。重要なのは、**コア機能が動作し、ユーザーが基本的な価値を得られる状態**にすることです。

**Q: MVPで実装すべき機能の優先順位は？**

A: 優先順位は以下の通りです：
1. **最優先**: 4つのコア機能（自分カルテ、健康計画、チーム&地域包括ケア、マイページ）
2. **高**: 外部カルテ連携、認証・セキュリティ（基本）
3. **中**: UI/UX（最小限）
4. **低**: その他の機能（MVP後でも可）

**Q: MVPでテストユーザーは何人必要ですか？**

A: MVPでは**10〜50人程度**のテストユーザーで十分です。開発チームと近しい関係者（家族、友人、同僚等）から始めることをおすすめします。

### βフェーズについて

**Q: βフェーズはいつから始めるべきですか？**

A: **MVPが完成し、基本的な動作が確認できた時点**でβフェーズを開始します。MVPで重大な問題が発生している場合は、まずそれを修正してからβフェーズに進むことをおすすめします。

**Q: βフェーズでどのくらいのユーザーを想定すべきですか？**

A: βフェーズでは**50〜500人程度**のユーザーを想定します。早期アダプター（新しい技術やサービスに興味のある人）を中心に募集します。

**Q: βフェーズで最も重要なタスクは何ですか？**

A: βフェーズで最も重要なタスクは以下の2つです：
1. **ユーザーフィードバックの収集・分析**: 実際のユーザーからフィードバックを得て、問題を特定・修正する
2. **パフォーマンス最適化**: ユーザー数が増えるにつれて発生するパフォーマンス問題を解決する

### リリースフェーズについて

**Q: リリースはいつ行うべきですか？**

A: **βフェーズで主要な問題が解決され、安定性が確認できた時点**でリリースを行います。具体的には：
- 重大なバグが解消されている
- パフォーマンスが安定している
- セキュリティ監査が完了している
- サポート体制が整っている

**Q: リリース後も開発は続けますか？**

A: はい、リリース後も**継続的に開発・改善**を続けます。ユーザーフィードバックに基づいて新機能を追加したり、既存機能を改善したりします。

**Q: リリース後の運営保守はどのくらいの頻度で行うべきですか？**

A: 運営保守の頻度は以下の通りです：
- **監視**: 24時間365日（自動化）
- **メンテナンス**: 月次（データベース最適化等）、四半期（セキュリティパッチ等）、年次（大規模アップグレード等）
- **セキュリティ監査**: 年1回
- **インシデント対応**: 発生時（24時間以内に対応）

### 開発・運営保守の基本

**Q: 開発と運営保守の違いは何ですか？**

A: 
- **開発**: 新しい機能を追加したり、既存機能を改善したりする作業
- **運営保守**: サービスが正常に動作するように監視・管理する作業

両方とも重要ですが、リリース後は運営保守の比重が高くなります。

**Q: 初心者でもこれらのタスクを実行できますか？**

A: はい、初心者でも実行できます。ただし、以下の点に注意してください：
- **セキュリティ関連**: 専門知識が必要な場合は、専門家に相談する
- **データベース操作**: 本番環境での操作は慎重に行う（バックアップを取る）
- **デプロイ**: テスト環境で十分にテストしてから本番環境にデプロイする

**Q: タスクの優先順位をどう決めればよいですか？**

A: 優先順位は以下の基準で決めます：
1. **ユーザーへの影響**: ユーザーに直接影響する機能を最優先
2. **セキュリティ**: セキュリティ関連の問題は最優先で対応
3. **安定性**: サービスが正常に動作するための基盤機能を優先
4. **新機能**: 新機能は安定性が確保されてから追加

### デプロイ・公開について

**Q: デプロイとは何ですか？初心者にも分かりやすく教えてください。**

A: デプロイとは、あなたのパソコンで動いているアプリを、インターネット上に公開して、誰でもアクセスできるようにすることです。

**例え話**: 
- **開発環境（ローカル）**: あなたの家のパソコンで動いているアプリ（あなただけが使える）
- **本番環境（デプロイ後）**: インターネット上のサーバーで動いているアプリ（世界中の誰でも使える）

**なぜ必要か**: 
- ユーザーが使えるようにするため
- 24時間365日動かすため（あなたのパソコンを常に起動しておく必要がない）
- 多くのユーザーが同時にアクセスしても対応できるため

**Q: デプロイはいつ行うべきですか？**

A: 以下の条件を満たしたらデプロイできます：

1. **MVPフェーズ完了時**: 
   - 3つのコア機能が動作する
   - ローカルで動作確認が完了している
   - ビルドが成功する（`pnpm build`）
   - 基本的なテストが通る

2. **βフェーズ完了時**: 
   - フィードバック収集機能が動作する
   - パフォーマンス最適化が完了している
   - セキュリティ強化が完了している

**Q: デプロイにどのくらい時間がかかりますか？**

A: 
- **初回デプロイ**: 30分〜1時間程度（アカウント作成、環境変数設定、データベース準備を含む）
- **2回目以降のデプロイ**: 5〜10分程度（コードの変更をプッシュするだけ）

**Q: デプロイは無料でできますか？**

A: はい、以下のサービスは無料プランで利用可能です：

- **Vercel**: 無料プランでNext.jsアプリをデプロイ可能（制限あり）
- **Supabase**: 無料プランでデータベースを利用可能（制限あり）
- **Resend**: 無料プランで月3,000通までメール送信可能
- **Cloudflare AI Gateway**: 無料枠あり

**注意**: ユーザー数が増えると、有料プランへの移行が必要になる場合があります。

**Q: デプロイ後、コードを変更したらどうなりますか？**

A: GitHubリポジトリとVercelを連携している場合、`main`ブランチにプッシュすると自動的に再デプロイされます。

**手順**:
1. コードを変更
2. `git add .`
3. `git commit -m "変更内容"`
4. `git push origin main`
5. Vercelが自動的にデプロイを開始
6. 数分後に新しいバージョンが公開される

**Q: デプロイ後、ユーザーはどうやってアプリにアクセスできますか？**

A: デプロイが完了すると、VercelからURLが提供されます（例: `https://your-app.vercel.app`）。このURLをユーザーに共有すれば、誰でもアクセスできます。

**カスタムドメインを使用する場合**:
- ドメインを購入（例: `personal-health-os.com`）
- Vercelでドメインを設定
- DNS設定を行う
- ユーザーは `https://personal-health-os.com` でアクセス可能

**Q: デプロイ後、エラーが発生したらどうすればよいですか？**

A: 以下の手順で確認・対応します：

1. **Vercelダッシュボードで確認**:
   - 「Logs」タブでエラーログを確認
   - 「Deployments」タブでデプロイの状態を確認

2. **Sentryで確認**（設定済みの場合）:
   - Sentryダッシュボードでエラーを確認
   - エラーの詳細を確認

3. **ローカルで再現**:
   - エラーをローカル環境で再現できるか確認
   - 再現できれば、ローカルで修正してから再デプロイ

4. **ロールバック**（必要に応じて）:
   - Vercelダッシュボードで過去のデプロイメントを選択
   - 「Promote to Production」をクリックしてロールバック

**Q: 本番環境と開発環境で環境変数を分ける必要がありますか？**

A: はい、**必ず分ける必要があります**。理由：

1. **セキュリティ**: 本番環境のAPIキーや秘密鍵を開発環境で使用しない
2. **データの分離**: 開発環境ではテストデータ、本番環境では実際のユーザーデータ
3. **設定の違い**: 本番環境では本番用のURL、開発環境ではローカルURL

**設定方法**:
- **開発環境**: `apps/web/.env.local` に設定
- **本番環境**: Vercelダッシュボードの「Environment Variables」で設定

**Q: デプロイ後、データベースのデータはどうなりますか？**

A: 
- **開発環境**: ローカルのデータベースまたは開発用Supabaseプロジェクトのデータ
- **本番環境**: 本番用Supabaseプロジェクトのデータ（別のデータベース）

**重要**: 
- 開発環境と本番環境のデータは**完全に分離**されています
- 本番環境のデータは、ユーザーが実際に入力したデータです
- 本番環境のデータを誤って削除しないよう注意してください

**Q: デプロイ後、ユーザーがサインアップできない場合は？**

A: 以下の点を確認してください：

1. **環境変数の確認**:
   - `BETTER_AUTH_SECRET` が設定されているか
   - `BETTER_AUTH_URL` が正しく設定されているか（本番環境のURL）

2. **データベースの確認**:
   - `DATABASE_URL` が正しく設定されているか
   - データベースのスキーマが適用されているか（`pnpm db:push`）

3. **メール認証の確認**（Resend設定済みの場合）:
   - `RESEND_API_KEY` が設定されているか
   - `RESEND_FROM_EMAIL` が設定されているか
   - Resendダッシュボードで送信ログを確認

4. **ログの確認**:
   - Vercelダッシュボードの「Logs」タブでエラーを確認
   - Sentryダッシュボードでエラーを確認

---

## 📝 まとめ

このドキュメントでは、Personal Health OS をMVPからβ版、そして本番リリースまで段階的に開発・運営していくためのタスクを解説しました。

### 重要なポイント

1. **段階的に進める**: MVP → β → リリースの順で、段階的に進めることが重要です。
2. **ユーザーフィードバックを重視**: 特にβフェーズでは、ユーザーフィードバックを積極的に収集・分析し、改善に活かします。
3. **セキュリティと安定性を最優先**: 新機能よりも、セキュリティと安定性を優先します。
4. **継続的な改善**: リリース後も継続的に改善・拡張を続けます。

### 次のステップ

1. **現状を把握**: このドキュメントの「8. 現状スナップショット（開発の現在地）」を読む
2. **MVPのタスクを確認**: このドキュメントの「MVP（Minimum Viable Product）フェーズ」のチェックリストを見る
3. **タスクを実行**: 優先順位の高いタスクから順に進める
4. **デプロイの準備**: MVPフェーズが完了したら、「9. デプロイ・公開手順」を参照してデプロイを実行
5. **進捗を更新**: 完了したチェック項目にチェックを入れ、現状スナップショットも必要に応じて更新する

---

## 📚 関連ドキュメント

- [VISION.md](./VISION.md) - プロジェクトのビジョンと理念
- [AGENTS.md](./AGENTS.md) - エージェント開発ルール
- [ERROR_HANDLING.md](./ERROR_HANDLING.md) - エラー対応フロー

---

## 10. 手動作業が必要なタスクの手順書

以下のタスクは環境変数の設定や外部サービスのアカウント作成が必要なため、手動作業が必要です。初心者向けに詳しく解説します。

> **注意**: これらの手順は、セクション9「デプロイ・公開手順」と併せて参照してください。デプロイ前に必要な設定も含まれています。

### 1. メール認証（Resend）の実装手順

#### ステップ1: Resendアカウントの作成

1. https://resend.com にアクセス
2. 「Sign Up」をクリックしてアカウントを作成（GitHubアカウントでログイン可能）
3. メールアドレスを確認（確認メールが届きます）

#### ステップ2: APIキーの取得

1. Resendダッシュボードにログイン
2. 「API Keys」タブを開く
3. 「Create API Key」をクリック
4. キー名を入力（例: "Personal Health OS Production"）
5. 権限を選択（「Send emails」を選択）
6. 「Create」をクリック
7. **表示されたAPIキーをコピー**（この画面を閉じると再度表示できません）

#### ステップ3: 環境変数の設定

1. `apps/web/.env.local` ファイルを開く（存在しない場合は作成）
2. 以下の環境変数を追加:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**重要**:
- `RESEND_API_KEY`: ステップ2で取得したAPIキー
- `RESEND_FROM_EMAIL`: 送信元メールアドレス（Resendでドメインを検証する必要があります。開発環境では `onboarding@resend.dev` を使用可能）

#### ステップ4: Better Authの設定を更新

1. `apps/web/lib/auth.ts` を開く
2. 以下のように変更:

```typescript
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { user, session, account, verification } from "./schema";
import { resend } from "better-auth/plugins/resend";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // false から true に変更
  },
  secret: process.env.BETTER_AUTH_SECRET || "change-me-in-production",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
  basePath: "/api/auth",
  plugins: [
    resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
    }),
  ],
});
```

#### ステップ5: 動作確認

1. 開発サーバーを再起動: `pnpm dev`
2. サインアップページ（`/signup`）にアクセス
3. 新しいアカウントを作成
4. メールボックスを確認（確認メールが届くか確認）
5. メール内のリンクをクリックしてメール認証を完了

**トラブルシューティング**:
- メールが届かない場合: Resendダッシュボードの「Logs」タブで送信状況を確認
- エラーが発生する場合: 環境変数が正しく設定されているか確認（`pnpm dev`を再起動）

---

### 2. AI Gateway連携の実装手順

#### ステップ1: AI Gatewayサービスの選択

以下のいずれかを選択します:

**オプションA: Cloudflare AI Gateway**（推奨）
- 無料枠あり
- 簡単にセットアップ可能
- https://developers.cloudflare.com/ai-gateway/

**オプションB: 独自のAI Gateway**
- より柔軟な設定が可能
- 自社で管理が必要

#### ステップ2: Cloudflare AI Gatewayのセットアップ（オプションAの場合）

**参考**: 公式ドキュメント: https://developers.cloudflare.com/ai-gateway/get-started/

1. **Cloudflareアカウントを作成**
   - https://dash.cloudflare.com にアクセス
   - アカウントを作成（無料プランで利用可能）

2. **Account IDを確認（最初に確認しておく）**
   
   Account IDは、AI GatewayのエンドポイントURLに必要です。以下のいずれかの方法で確認できます:
   
   **方法1: 右側サイドバーから確認**
   - ダッシュボードの任意のページで、画面右側のサイドバーを確認
   - 「**Account ID**」という項目が表示されている場合、その値をコピー
   
   **方法2: ドメイン設定ページから確認**
   - ダッシュボードで任意のドメインを選択（ドメインがない場合は、まずドメインを追加）
   - ドメインの概要ページで、右側サイドバーに「**Account ID**」が表示されます
   
   **方法3: APIトークン作成画面から確認**
   - ダッシュボード右上のプロフィールアイコン（人型アイコン）をクリック
   - 「**My Profile**」を選択
   - 左側メニューから「**API Tokens**」を選択
   - このページの右側サイドバーに「**Account ID**」が表示されます
   
   **方法4: URLから確認**
   - ダッシュボードの任意のページのURLを確認
   - URL形式: `https://dash.cloudflare.com/{account_id}/...`
   - この`{account_id}`部分がAccount IDです

3. **AI Gatewayを作成**
   - Cloudflareダッシュボードにログイン
   - 左側のメニューから「**AI**」を選択
   - 「**AI Gateway**」をクリック
   - 「**Create Gateway**」ボタンをクリック
   - **Gateway名**を入力（64文字以内、例: `my-health-os-gateway`）
   - 「**Create**」をクリック
   - 作成後、Gateway一覧画面に戻ります

4. **Gateway名（Gateway IDとして使用）の確認**
   
   **重要**: Cloudflare AI Gatewayでは、Gateway IDとして**Gateway名**を使用します。
   
   **確認方法**:
   - AI Gateway一覧画面で、作成したGatewayの**名前**を確認
   - この名前が、エンドポイントURLの`{gateway_id}`として使用されます
   - 例: Gateway名が`my-health-os-gateway`の場合、エンドポイントは:
     ```
     https://gateway.ai.cloudflare.com/v1/{account_id}/my-health-os-gateway/compat
     ```
   
   **Gateway詳細画面で確認する場合**:
   - Gateway一覧で、作成したGatewayの名前をクリック
   - Gateway詳細画面の上部に、Gateway名が表示されます
   - この画面のURLにもGateway名が含まれています

5. **プロバイダー認証の設定（3つのオプションから選択）**
   
   AI Gatewayを使用してAIプロバイダー（OpenAI、Anthropic、Google AI Studioなど）にアクセスするには、以下のいずれかの方法で認証を設定します:
   
   **オプションA: Request Headers（最も簡単・推奨）**
   
   この方法では、コード内でリクエストヘッダーにプロバイダーのAPIキーを含めます。
   
   **設定手順**:
   - 特別な設定は不要です（Gateway作成のみでOK）
   - コード内で、通常通りプロバイダーのAPIキーをリクエストヘッダーに含めます
   - 例: `Authorization: Bearer <OPENAI_API_KEY>`
   - この方法が最も簡単で、既存のコードを最小限の変更で使用できます
   - **推奨**: 初心者の方はこの方法から始めることをお勧めします
   
   **オプションB: BYOK（Bring Your Own Keys）**
   
   CloudflareにAPIキーを保存し、AI Gatewayが自動的に使用します。
   
   **注意**: BYOKの設定は、Gateway詳細画面の「**Settings**」タブには表示されません。以下のいずれかの方法で設定可能です:
   
   - **方法1**: Gateway作成時に設定（Gateway作成画面でAPIキーを入力するオプションがある場合）
   - **方法2**: Cloudflare API経由で設定（上級者向け）
   - **方法3**: 公式ドキュメントを参照: https://developers.cloudflare.com/ai-gateway/configuration/bring-your-own-keys/
   
   **推奨**: 初心者の方は、まずオプションA（Request Headers）を使用し、必要に応じてBYOKを検討してください。
   
   **オプションC: Unified Billing（Cloudflare経由で請求）**
   
   Cloudflareの請求システムを使用してプロバイダーに支払います。
   
   **設定手順**:
   - Gateway詳細画面の「**Settings**」タブには表示されません
   - Cloudflareアカウントにクレジットを追加する必要があります
   - この方法は設定が複雑な場合があるため、上級者向けです
   - 詳細: https://developers.cloudflare.com/ai-gateway/features/unified-billing/
   
   **推奨**: 初心者の方は、まずオプションA（Request Headers）を使用してください。

6. **Gateway設定（Settings画面の各セクション）**
   
   Gateway詳細画面の「**Settings**」タブには、以下のセクションが表示されます:
   
   **6-1. Collect logs（ログ収集）**
   - リクエストとレスポンスのペイロード（プロンプト、レスポンス、プロバイダー、タイムスタンプ、ステータス）を保存
   - デフォルトの上限: 10,000,000件
   - 「Automatically delete: Delete the oldest logs」を有効にすると、上限に達した際に古いログが自動削除されます
   - ログのエクスポート: 「Exporting AI Gateway Logs」セクションから、Logpushを使用して外部ストレージにエクスポート可能
   
   **6-2. Cached Responses（キャッシュレスポンス）**
   - キャッシュからリクエストを提供することで、コスト削減とレスポンス速度向上を実現
   - デフォルト: 5分より古いキャッシュされたリクエストを自動的にクリア
   - 「change」ボタンから設定を変更可能
   
   **6-3. Rate limit requests（レート制限）**
   - トラフィックを制御して、支出を制限したり、不正な活動を防ぐためにリクエストを制限
   - デフォルト: 1分間の固定期間で50リクエストを超える場合にトラフィックをスロットル
   - 「change」ボタンから設定を変更可能
   
   **6-4. Authenticated Gateway（認証付きゲートウェイ）**
   
   **注意**: 認証付きゲートウェイは、Gatewayへのアクセス自体を保護する機能です。プロバイダー認証とは別の設定です。
   
   **設定手順**:
   1. 「**Authenticated Gateway**」セクションを確認
   2. 「**Create an authentication token**」リンクをクリック（または「change」ボタン）
   3. 認証トークンを作成すると、各リクエストにCloudflare APIトークンが必要になります
   
   **APIトークンを作成する場合**:
   1. 「**Create an authentication token**」をクリック
   2. または、ダッシュボード右上のプロフィールアイコン（人型アイコン）→「**My Profile**」→「**API Tokens**」から作成
   3. 「**Create Token**」をクリック
   4. 「**カスタムトークン**」を選択
   5. トークン名を入力（例: `AI Gateway Token`）
   6. 権限を設定:
      - 「**Account**」を展開
      - 「**AI Gateway**」を展開
      - 「**Read**」（読み取りのみ）または「**Edit**」（編集も可能）を選択
   7. 「**Continue to summary**」をクリック
   8. 「**Create Token**」をクリック
   9. **表示されたトークンを必ずコピーして保存**（一度しか表示されません）
   
   **注意**: 認証付きゲートウェイを使用しない場合（認証なしゲートウェイ）は、この設定は不要です。認証なしゲートウェイでも、プロバイダー認証（オプションA、B、C）は使用できます。
   
   **6-5. Otel Integration（OpenTelemetry統合）**
   - OpenTelemetryエンドポイントにトレースデータを自動的に報告するように設定
   - 上級者向けの機能です
   
   **6-6. Delete a gateway（ゲートウェイの削除）**
   - ゲートウェイを削除する機能（削除は元に戻せません）
   
   **APIトークンを作成する場合**:
   1. ダッシュボード右上のプロフィールアイコン（人型アイコン）をクリック
   2. 「**My Profile**」を選択
   3. 左側メニューから「**API Tokens**」を選択
   4. 「**Create Token**」をクリック
   5. 「**カスタムトークン**」を選択
   6. トークン名を入力（例: `AI Gateway Token`）
   7. 権限を設定:
      - 「**Account**」を展開
      - 「**AI Gateway**」を展開
      - 「**Read**」（読み取りのみ）または「**Edit**」（編集も可能）を選択
   8. 「**Continue to summary**」をクリック
   9. 「**Create Token**」をクリック
   10. **表示されたトークンを必ずコピーして保存**（一度しか表示されません）
   
   **注意**: 認証付きゲートウェイを使用しない場合（認証なしゲートウェイ）は、この手順は不要です。認証なしゲートウェイでも、プロバイダー認証（オプションA、B、C）は使用できます。

7. **エンドポイントURLの確認**
   
   作成したGatewayのエンドポイントURLは以下の形式です:
   
   ```
   https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/compat
   ```
   
   **例**:
   - Account ID: `abc123def456`
   - Gateway名: `my-health-os-gateway`
   - エンドポイント: `https://gateway.ai.cloudflare.com/v1/abc123def456/my-health-os-gateway/compat`
   
   **確認方法**:
   - Gateway詳細画面の「**Overview**」タブまたは「**Settings**」タブに、エンドポイントURLが表示されている場合があります
   - または、上記の形式に基づいて手動で構築してください

#### ステップ3: 環境変数の設定

1. `apps/web/.env.local` ファイルを開く
2. 以下の環境変数を追加:

```bash
# Cloudflare AI Gateway設定
CLOUDFLARE_ACCOUNT_ID=your-account-id-here  # ステップ2-2で取得したAccount ID
CLOUDFLARE_GATEWAY_NAME=your-gateway-name-here  # ステップ2-3で作成したGateway名（Gateway IDとして使用）
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token-here  # 認証付きゲートウェイを使用する場合のみ必要（ステップ2-6参照）

# AI Gatewayエンドポイント（オプション - 通常は自動構築されるため不要）
# エンドポイントURLは、Account IDとGateway名から自動的に構築されます
# 直接指定したい場合のみ、以下の環境変数を設定してください
# CLOUDFLARE_AI_GATEWAY_ENDPOINT=https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_name}/compat

# AI プロバイダーAPIキー（Request Headers方式を使用する場合のみ必要）
# オプションB（BYOK）またはオプションC（Unified Billing）を使用する場合は不要
OPENAI_API_KEY=your-openai-api-key-here  # OpenAIを使用する場合
ANTHROPIC_API_KEY=your-anthropic-api-key-here  # Anthropicを使用する場合
GOOGLE_AI_API_KEY=your-google-ai-api-key-here  # Google AI Studioを使用する場合
```

**環境変数の説明**:
- `CLOUDFLARE_ACCOUNT_ID`: ステップ2-2で取得したAccount ID（必須）
  - 例: `abc123def456`
- `CLOUDFLARE_GATEWAY_NAME`: ステップ2-3で作成したGateway名（必須）
  - **重要**: Gateway IDとして使用されるのは、Gateway名です
  - 例: `my-health-os-gateway`
- `CLOUDFLARE_API_TOKEN`: 認証付きゲートウェイを使用する場合のみ必要
  - ステップ2-6で作成したAPIトークン
  - 認証なしゲートウェイを使用する場合は設定不要
- `CLOUDFLARE_AI_GATEWAY_ENDPOINT`: **オプション**（通常は設定不要）
  - エンドポイントURLを直接指定したい場合のみ設定
  - 通常は、Account IDとGateway名から自動的に構築されるため、この環境変数は不要です
  - 例: `https://gateway.ai.cloudflare.com/v1/abc123def456/my-health-os-gateway/compat`
- `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GOOGLE_AI_API_KEY`: 
  - **オプションA（Request Headers方式）**を使用する場合のみ必要
  - オプションB（BYOK）またはオプションC（Unified Billing）を使用する場合は設定不要

**エンドポイントURLの構築方法**:
- **推奨**: Account IDとGateway名から動的に構築（コード内で自動生成）
  - エンドポイントURL: `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/${CLOUDFLARE_GATEWAY_NAME}/compat`
  - この方法により、Account IDやGateway名を変更した際に、エンドポイントURLも自動的に更新されます
- **代替**: エンドポイントURLを直接`.env`に保存することも可能ですが、通常は推奨されません
  - Account IDやGateway名を変更した際に、エンドポイントURLも手動で更新する必要があります

**AI Gatewayの役割**:
- 外部AI API（OpenAI、Anthropic、Google AI Studioなど）へのリクエストをルーティング
- キャッシング、レート制限、監視、ログ記録などの機能を提供
- 複数のAIプロバイダーを統一的なエンドポイントで利用可能

#### ステップ4: AI Gatewayクライアントの実装

1. `apps/web/lib/services/ai-gateway.ts` を作成

   **統合方法の選択**:
   
   **推奨: Unified API (OpenAI-Compatible) エンドポイント**
   - OpenAI SDKと互換性があり、既存のコードを最小限の変更で使用可能
   - 複数のプロバイダーを同じコードで切り替え可能
   - エンドポイント: `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/compat`
   
   **代替: Provider-specific endpoints**
   - 各プロバイダーの元のAPIスキーマを維持
   - エンドポイント: `https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_id}/{provider}`
   
2. **実装例（Unified API方式）**:

```typescript
// apps/web/lib/services/ai-gateway.ts
import OpenAI from "openai";

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const gatewayName = process.env.CLOUDFLARE_GATEWAY_NAME; // Gateway名（Gateway IDとして使用）
const apiToken = process.env.CLOUDFLARE_API_TOKEN; // 認証付きゲートウェイの場合のみ必要
const providerApiKey = process.env.OPENAI_API_KEY; // Request Headers方式の場合のみ必要

// エンドポイントURLの構築（推奨: 動的構築）
// オプション: 環境変数から直接読み取る場合
// const baseURL = process.env.CLOUDFLARE_AI_GATEWAY_ENDPOINT || 
//   `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/compat`;

// 推奨: Account IDとGateway名から動的に構築
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayName}/compat`;

// 認証付きゲートウェイを使用する場合
const client = new OpenAI({
  apiKey: providerApiKey, // プロバイダーのAPIキー（Request Headers方式の場合）
  defaultHeaders: apiToken ? {
    "cf-aig-authorization": `Bearer ${apiToken}`, // Cloudflare APIトークン
  } : {},
  baseURL,
});

// 認証なしゲートウェイを使用する場合
// const client = new OpenAI({
//   apiKey: providerApiKey, // Request Headers方式の場合のみ必要
//   baseURL,
// });

// BYOKまたはUnified Billingを使用する場合（プロバイダーAPIキー不要）
// const client = new OpenAI({
//   apiKey: apiToken || "dummy", // 認証付きゲートウェイの場合のみCloudflare APIトークン
//   defaultHeaders: apiToken ? {
//     "cf-aig-authorization": `Bearer ${apiToken}`,
//   } : {},
//   baseURL,
// });

// 使用例: 複数のプロバイダーを切り替え可能
export async function analyzeHealthData(prompt: string, provider: 'openai' | 'anthropic' | 'google' = 'openai') {
  const modelMap = {
    openai: 'openai/gpt-4o-mini',
    anthropic: 'anthropic/claude-sonnet-4-5',
    google: 'google-ai-studio/gemini-2.5-flash',
  };

  try {
    const response = await client.chat.completions.create({
      model: modelMap[provider],
      messages: [{ role: "user", content: prompt }],
    });
    
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error('AI Gateway error:', error);
    // フォールバック処理（ルールベース分析など）
    throw error;
  }
}
```

3. **機能要件**:
   - 健康データ分析とマッチングスコア計算機能
   - 複数のAIプロバイダー対応（OpenAI、Anthropic、Google AI Studioなど）
   - フォールバック機能（AI Gateway利用不可時のルールベース処理）
   - エラーハンドリングとリトライ機能
   - レート制限対応

#### ステップ5: AI分析サービスの更新

1. `apps/web/lib/services/ai-analysis.ts` を更新
2. AI Gateway連携によるAI分析機能を追加
3. 集計データからAI Gateway入力への変換関数を追加
4. エラーハンドリングとフォールバック機能を実装

**重要な注意事項**:

- **フォールバック処理**: AI Gatewayが利用できない場合は、自動的にルールベースの分析にフォールバックします
- **データプライバシー**: AI Gatewayに送信するデータは、個人識別可能情報（PII）を含まない集計データのみとします（AGENTS.mdの原則に従う）
- **レート制限**: AI Gatewayのレート制限機能を活用して、API呼び出しを制御します
- **キャッシング**: AI Gatewayのキャッシング機能により、同じリクエストのコスト削減とレスポンス速度向上が可能です
- **監視**: AI GatewayダッシュボードでAPI使用量、レイテンシー、エラー率を監視できます

**参考リンク**:
- [AI Gateway公式ドキュメント](https://developers.cloudflare.com/ai-gateway/)
- [Unified API (Chat Completion) ドキュメント](https://developers.cloudflare.com/ai-gateway/usage/chat-completion/)
- [動的ルーティング（フォールバック、A/Bテスト）](https://developers.cloudflare.com/ai-gateway/features/dynamic-routing/)
- [キャッシング機能](https://developers.cloudflare.com/ai-gateway/features/caching/)
- [レート制限機能](https://developers.cloudflare.com/ai-gateway/features/rate-limiting/)

---

### 3. AIマッチング（AI Gateway連携）の実装手順

**前提条件**: AI Gateway連携が完了していること

#### ステップ1: マッチングアルゴリズムの更新

1. `apps/web/lib/services/group.ts` を更新
2. `findMatchingGroups` 関数を更新
3. AI Gatewayによるマッチングスコア計算機能を追加
4. ルールベース計算のフォールバック機能を追加
5. マッチング理由の返却機能を追加

#### ステップ2: 動作確認

1. グループを作成
2. 複数のユーザーでグループに参加
3. マッチング機能をテスト
4. マッチングスコアが正しく計算されるか確認

**注意**: AI Gatewayが利用できない場合は、自動的にルールベースのマッチングスコア計算にフォールバックします。

---

### 4. Stripe決済機能の設定手順

#### ステップ1: Stripeアカウントの作成

1. https://stripe.com にアクセス
2. 「Sign up」をクリックしてアカウントを作成
3. メールアドレスを確認（確認メールが届きます）
4. ビジネス情報を入力（テスト環境では簡易的な情報でOK）

#### ステップ2: APIキーの取得

1. Stripeダッシュボードにログイン
2. 「Developers」→「API keys」をクリック
3. **テストモード**と**本番モード**の切り替えを確認
   - 開発中は「Test mode」を使用
   - 本番環境では「Live mode」を使用
4. 以下のキーをコピー:
   - **Publishable key**（`pk_test_...` または `pk_live_...`）
   - **Secret key**（`sk_test_...` または `sk_live_...`）

#### ステップ3: 価格プランの作成

1. Stripeダッシュボードで「Products」→「Add product」をクリック
2. 製品情報を入力:
   - **Name**: 「アドバイザープラン」
   - **Description**: 「高度な分析とサポート」
3. 「Pricing」セクションで:
   - **Pricing model**: 「Standard pricing」
   - **Price**: `980`（日本円）
   - **Billing period**: 「Monthly」
4. 「Save product」をクリック
5. 作成された**Price ID**（`price_...`）をコピー

#### ステップ4: Webhookの設定

1. Stripeダッシュボードで「Developers」→「Webhooks」をクリック
2. 「Add endpoint」をクリック
3. エンドポイントURLを入力:
   - 開発環境: `http://localhost:3001/api/stripe/webhook`（Stripe CLIを使用）
   - 本番環境: `https://your-app.vercel.app/api/stripe/webhook`
4. イベントを選択:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. 「Add endpoint」をクリック
6. **Signing secret**（`whsec_...`）をコピー

#### ステップ5: 環境変数の設定

**開発環境**（`apps/web/.env.local`）:
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ADVISOR_PRICE_ID=price_...
```

**本番環境**（Vercelの環境変数）:
```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_ADVISOR_PRICE_ID=price_...
```

**重要**: 
- テストモードと本番モードで異なるキーを使用します
- 本番環境では必ず「Live mode」のキーを使用してください

#### ステップ6: 動作確認

1. 開発サーバーを再起動: `pnpm dev`
2. `/pricing` ページにアクセス
3. 「アドバイザープラン」の「アップグレード」ボタンをクリック
4. Stripe Checkoutが表示されることを確認
5. テストカードで決済をテスト:
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 未来の日付
   - CVC: 任意の3桁
   - 郵便番号: 任意

**トラブルシューティング**:
- Checkoutが表示されない場合: `STRIPE_PUBLISHABLE_KEY` が正しく設定されているか確認
- Webhookが動作しない場合: Webhook URLが正しく設定されているか、`STRIPE_WEBHOOK_SECRET` が正しいか確認

---

## 8. 現状スナップショット（開発の現在地）

### 実装予定の主要機能

#### Beneficiary Platform基盤
- [ ] 認証・認可基盤（サインアップ/ログイン/ログアウト、メール認証）
- [ ] 外部カルテ連携認証（OAuth 2.0、SMART on FHIR）
- [ ] ユーザーインターフェース（ナビゲーション、レスポンシブデザイン）

#### Beneficiary Platform コア機能
- [ ] 自分カルテ（薬情報、受診歴、疾患情報、検査データ、外部カルテ連携）
- [ ] 健康計画（リスク予測、予防計画、AI分析、ビッグデータ分析）
- [ ] チーム&地域包括ケア（グループ、投稿、AIマッチング、支援事業所検索）
- [ ] マイページ（通知、設定、プラン、外部カルテ連携設定）

#### 外部カルテ連携
- [ ] FHIR R4対応（FHIR Client実装）
- [ ] SS-MIX2形式のサポート
- [ ] HL7形式のサポート
- [ ] OAuth 2.0 / SMART on FHIR認証
- [ ] 複数医療機関からのデータ取得
- [ ] 自動データ同期機能
- [ ] データ連携履歴の管理

#### 電子保存の三原則
- [ ] 真正性：デジタル署名、ハッシュ計算、監査ログ拡張
- [ ] 見読性：FHIR/SS-MIX2/HL7/XML/PDF/A対応、メタデータ管理
- [ ] 保存性：バックアップ機能、データ移行機能、整合性チェック

#### 遠隔医療・mHealth対応
- [ ] ウェアラブルデバイス連携（Apple Health、Google Fit、Fitbit等）
- [ ] モバイルアプリ対応（PWA、プッシュ通知）

### 実装予定ファイル一覧

**スキーマ・マイグレーション**
- `apps/web/lib/schema.ts` - 外部カルテ連携、電子保存テーブル追加
- `apps/web/drizzle/0001_external_ehr_schema.sql` - マイグレーションSQL（外部カルテ連携用）

**認証・外部カルテ連携**
- `apps/web/lib/services/ehr-connection.ts` - 外部カルテ接続サービス
- `apps/web/lib/services/fhir-client.ts` - FHIR Client実装
- `apps/web/lib/services/oauth2.ts` - OAuth 2.0認証サービス
- `apps/web/lib/services/smart-on-fhir.ts` - SMART on FHIR認証サービス

**Beneficiary Platform**
- `apps/web/app/beneficiary/page.tsx` - ダッシュボード
- `apps/web/app/beneficiary/medical-record/page.tsx` - 自分カルテ
- `apps/web/app/beneficiary/health-plan/page.tsx` - 健康計画
- `apps/web/app/beneficiary/groups/page.tsx` - チーム&地域包括ケア
- `apps/web/app/beneficiary/my-page/page.tsx` - マイページ
- `apps/web/app/beneficiary/ehr-connections/page.tsx` - 外部カルテ連携設定
- `apps/web/app/beneficiary/loading.tsx` - ローディングUI
- `apps/web/app/api/beneficiary/ehr-connections/route.ts` - 外部カルテ連携API
- `apps/web/app/api/beneficiary/ehr-sync/route.ts` - データ同期API

**電子保存サービス**
- `apps/web/lib/services/digital-signature.ts` - 真正性サービス
- `apps/web/lib/services/backup.ts` - 保存性サービス
- `apps/web/lib/services/data-migration.ts` - データ移行サービス
- `apps/web/lib/services/export.ts` - エクスポートサービス（FHIR/SS-MIX2/XML/PDF対応）

**パフォーマンス**
- `apps/web/lib/swr-config.tsx` - SWRグローバル設定
- `apps/web/app/loading.tsx` - ルートローディングUI
- 各ページの `loading.tsx` ファイル

**設定ファイル**
- `apps/web/vercel.json` - Vercel Cron設定
- `apps/web/ENV_SETUP.md` - 環境変数ドキュメント

### 手動作業が必要な項目

1. **データベースマイグレーション実行**
   - `apps/web/drizzle/0001_external_ehr_schema.sql` をSupabaseで実行

2. **環境変数設定**
   - `DIGITAL_SIGNATURE_SECRET` - デジタル署名用シークレット
   - `EHR_CLIENT_ID`、`EHR_CLIENT_SECRET` - 外部カルテ連携用認証情報

3. **Cronジョブ設定**
   - Vercelデプロイ後、自動的に `vercel.json` のCron設定が有効化される

4. **macOS開発環境設定**
   - ファイルディスクリプタ制限の引き上げ（セクション6.4参照）

### これから必要な作業

#### 優先度: 高

1. **外部カルテ連携基盤の実装**
   - FHIR R4 Client実装
   - OAuth 2.0 / SMART on FHIR認証
   - SS-MIX2、HL7形式のサポート

2. **Beneficiary Platform コア機能の実装**
   - 自分カルテ機能（外部カルテ連携含む）
   - 健康計画機能（ビッグデータ分析含む）
   - チーム&地域包括ケア機能
   - マイページ機能（外部カルテ連携設定含む）

3. **電子保存の三原則の実装**
   - 真正性：デジタル署名、改ざん検知
   - 見読性：標準フォーマット対応
   - 保存性：バックアップ、データ移行

#### 優先度: 中

4. **テスト環境の整備**
   - E2Eテスト（Playwright）の実装
   - ユニットテスト（Vitest）の実装
   - CI/CDパイプラインへのテスト統合

5. **UI/UX改善**
   - フィードバックに基づくUI改善
   - アクセシビリティ対応強化
   - モバイル対応の改善

6. **セキュリティ強化**
   - ペネトレーションテスト
   - セキュリティ監査
   - 脆弱性スキャン自動化

#### 優先度: 低

7. **機能拡張**
   - ウェアラブルデバイス連携
   - PWA対応
   - 多言語対応
   - ブロックチェーン技術の統合（真正性強化）

---

**最終更新**: 2025年1月XX日（Beneficiary Platform中心に再構築）

