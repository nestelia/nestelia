---
title: パフォーマンス
description: NestJS、Express、Fastify との Nestelia ベンチマーク結果比較
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# パフォーマンス

Nestelia は Elysia の上にデコレーターと依存性注入の薄いレイヤーを追加します — パフォーマンスへの影響はほぼゼロです。結果：Elysia レベルの速度で NestJS スタイルの開発体験を実現。

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="リクエスト/秒で測定。GET / → プレーンテキスト 'Hello World'。500 接続、10 秒間。"
/>

## 再現方法

```bash
# ベンチマーク依存関係をインストール
cd benchmark && bun install && cd ..

# 負荷テストツールをインストール
brew install bombardier

# すべてのベンチマークを実行
bun benchmark/run.ts

# または特定のフレームワークを実行
bun benchmark/run.ts nestelia elysia fastify
```

## なぜ Nestelia は速いのか？

Nestelia はすべての依存性注入、モジュール配線、ルート登録を**起動時**に解決します。リクエスト処理時には、コントローラーがサービスメソッドを直接呼び出します — ミドルウェアチェーンもリクエストごとのコンテナ検索もありません。

| | Nestelia | NestJS |
|---|---|---|
| ランタイム | Bun | Node.js |
| HTTP レイヤー | Elysia | Express（デフォルト） |
| DI 解決 | 起動時 | 起動時 |
| ミドルウェアチェーン | なし（Elysia ハンドラー） | Express ミドルウェアスタック |
| バリデーション | Elysia TypeBox（コンパイル時） | class-validator（ランタイムリフレクション） |
