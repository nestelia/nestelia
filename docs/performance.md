---
title: Performance
description: Nestelia benchmark results compared to NestJS, Express, and Fastify
---

<script setup>
import PerformanceChart from './.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from './.vitepress/theme/benchmark-data'
</script>

# Performance

Nestelia adds a thin decorator and dependency-injection layer on top of Elysia — with near-zero overhead. The result: NestJS-style developer experience at Elysia-level speed.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Average reqs/s across 5 scenarios. 500 connections, 10s per scenario. macOS arm64, Bun 1.3, Node 24."
/>

## Results by scenario

| Scenario | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Service** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **Average** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## How to reproduce

```bash
# Install benchmark dependencies
cd benchmark && bun install && cd ..

# Install a load testing tool
brew install bombardier

# Run all benchmarks (5 scenarios × 5 frameworks)
bun run bench

# Or run specific frameworks
bun run bench nestelia elysia fastify
```

## Why is Nestelia fast?

Nestelia resolves all dependency injection, module wiring, and route registration **at startup time**. At request time, simple handlers call service methods directly — no middleware chain, no per-request container lookups, no reflection.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| HTTP layer | Elysia | Express (default) |
| DI resolution | Startup-time | Startup-time |
| Metadata reflection | Cached at startup | Per-request |
| Request context | Fast path skips it | Always created |
| Middleware chain | None (Elysia handlers) | Express middleware stack |
| Validation | Elysia TypeBox (compile-time) | class-validator (runtime reflection) |
