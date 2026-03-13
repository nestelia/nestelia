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
  methodology="초당 요청 수로 측정. GET / → 일반 텍스트 'Hello World'. 500 연결, 10초 지속."
/>

## 재현 방법

```bash
# 벤치마크 의존성 설치
cd benchmark && bun install && cd ..

# 부하 테스트 도구 설치
brew install bombardier

# 모든 벤치마크 실행
bun benchmark/run.ts

# 또는 특정 프레임워크만 실행
bun benchmark/run.ts nestelia elysia fastify
```

## Nestelia는 왜 빠른가요?

Nestelia는 모든 의존성 주입, 모듈 연결, 라우트 등록을 **시작 시점**에 해결합니다. 요청 처리 시에는 컨트롤러가 서비스 메서드를 직접 호출합니다 — 미들웨어 체인도, 요청별 컨테이너 조회도 없습니다.

| | Nestelia | NestJS |
|---|---|---|
| 런타임 | Bun | Node.js |
| HTTP 레이어 | Elysia | Express (기본값) |
| DI 해결 | 시작 시점 | 시작 시점 |
| 미들웨어 체인 | 없음 (Elysia 핸들러) | Express 미들웨어 스택 |
| 유효성 검사 | Elysia TypeBox (컴파일 시점) | class-validator (런타임 리플렉션) |
