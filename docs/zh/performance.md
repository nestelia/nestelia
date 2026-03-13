---
title: 性能
description: Nestelia 与 NestJS、Express 和 Fastify 的基准测试对比结果
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# 性能

Nestelia 在 Elysia 之上添加了一层轻量的装饰器和依赖注入层——几乎没有性能开销。结果：以 Elysia 级别的速度获得 NestJS 风格的开发体验。

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="5 个场景的平均请求数/秒。500 连接，每个场景 10 秒。macOS arm64，Bun 1.3，Node 24。"
/>

## 各场景结果

| 场景 | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Service** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **平均** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## 如何复现

```bash
# 安装基准测试依赖
cd benchmark && bun install && cd ..

# 安装负载测试工具
brew install bombardier

# 运行所有基准测试（5 个场景 × 5 个框架）
bun run bench

# 或运行特定框架
bun run bench nestelia elysia fastify
```

## 为什么 Nestelia 这么快？

Nestelia 在**启动时**完成所有依赖注入、模块连接和路由注册。在请求处理时，控制器直接调用服务方法——没有中间件链，没有每次请求的容器查找。

| | Nestelia | NestJS |
|---|---|---|
| 运行时 | Bun | Node.js |
| HTTP 层 | Elysia | Express（默认） |
| DI 解析 | 启动时 | 启动时 |
| 元数据反射 | 启动时缓存 | 每次请求 |
| 请求上下文 | 快速路径跳过 | 始终创建 |
| 中间件链 | 无（Elysia 处理器） | Express 中间件栈 |
| 验证 | Elysia TypeBox（编译时） | class-validator（运行时反射） |
