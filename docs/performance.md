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
  methodology="Measured in requests/second. GET / → plain text 'Hello World'. 500 connections, 10s duration."
/>

## How to reproduce

```bash
# Install benchmark dependencies
cd benchmark && bun install && cd ..

# Install a load testing tool
brew install bombardier

# Run all benchmarks
bun benchmark/run.ts

# Or run specific frameworks
bun benchmark/run.ts nestelia elysia fastify
```

## Why is Nestelia fast?

Nestelia resolves all dependency injection, module wiring, and route registration **at startup time**. At request time, controllers call service methods directly — no middleware chain, no per-request container lookups.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| HTTP layer | Elysia | Express (default) |
| DI resolution | Startup-time | Startup-time |
| Middleware chain | None (Elysia handlers) | Express middleware stack |
| Validation | Elysia TypeBox (compile-time) | class-validator (runtime reflection) |
