---
title: 성능
description: NestJS, Express, Fastify와 비교한 Nestelia 벤치마크 결과
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# 성능

Nestelia는 Elysia 위에 얇은 데코레이터와 의존성 주입 레이어를 추가합니다 — 성능 오버헤드는 거의 제로입니다. 결과: Elysia 수준의 속도로 NestJS 스타일의 개발 경험을 제공합니다.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="5개 시나리오의 평균 요청 수/초. 500 연결, 시나리오당 10초. macOS arm64, Bun 1.3, Node 24."
/>

## 시나리오별 결과

| 시나리오 | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Service** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **평균** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## 재현 방법

```bash
# 벤치마크 의존성 설치
cd benchmark && bun install && cd ..

# 부하 테스트 도구 설치
brew install bombardier

# 모든 벤치마크 실행 (5개 시나리오 × 5개 프레임워크)
bun run bench

# 또는 특정 프레임워크만 실행
bun run bench nestelia elysia fastify
```

## Nestelia는 왜 빠른가요?

Nestelia는 모든 의존성 주입, 모듈 연결, 라우트 등록을 **시작 시점**에 해결합니다. 요청 처리 시에는 컨트롤러가 서비스 메서드를 직접 호출합니다 — 미들웨어 체인도, 요청별 컨테이너 조회도 없습니다.

| | Nestelia | NestJS |
|---|---|---|
| 런타임 | Bun | Node.js |
| HTTP 레이어 | Elysia | Express (기본값) |
| DI 해결 | 시작 시점 | 시작 시점 |
| 메타데이터 리플렉션 | 시작 시 캐시 | 요청마다 |
| 요청 컨텍스트 | 빠른 경로로 건너뜀 | 항상 생성 |
| 미들웨어 체인 | 없음 (Elysia 핸들러) | Express 미들웨어 스택 |
| 유효성 검사 | Elysia TypeBox (컴파일 시점) | class-validator (런타임 리플렉션) |
