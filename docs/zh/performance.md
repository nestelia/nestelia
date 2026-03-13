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
  methodology="以每秒请求数衡量。GET / → 纯文本 'Hello World'。500 连接，10 秒持续时间。"
/>

## 如何复现

```bash
# 安装基准测试依赖
cd benchmark && bun install && cd ..

# 安装负载测试工具
brew install bombardier

# 运行所有基准测试
bun benchmark/run.ts

# 或运行特定框架
bun benchmark/run.ts nestelia elysia fastify
```

## 为什么 Nestelia 这么快？

Nestelia 在**启动时**完成所有依赖注入、模块连接和路由注册。在请求处理时，控制器直接调用服务方法——没有中间件链，没有每次请求的容器查找。

| | Nestelia | NestJS |
|---|---|---|
| 运行时 | Bun | Node.js |
| HTTP 层 | Elysia | Express（默认） |
| DI 解析 | 启动时 | 启动时 |
| 中间件链 | 无（Elysia 处理器） | Express 中间件栈 |
| 验证 | Elysia TypeBox（编译时） | class-validator（运行时反射） |
