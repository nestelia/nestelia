---
title: Производительность
description: Результаты бенчмарков Nestelia в сравнении с NestJS, Express и Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Производительность

Nestelia добавляет тонкий слой декораторов и внедрения зависимостей поверх Elysia — практически без потери производительности. Результат: удобство разработки как в NestJS на скорости Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Среднее кол-во запросов/с по 5 сценариям. 500 соединений, 10с на сценарий. macOS arm64, Bun 1.3, Node 24."
/>

## Результаты по сценариям

| Сценарий | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Сервис** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **Среднее** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## Как воспроизвести

```bash
# Установить зависимости бенчмарка
cd benchmark && bun install && cd ..

# Установить инструмент нагрузочного тестирования
brew install bombardier

# Запустить все бенчмарки (5 сценариев × 5 фреймворков)
bun run bench

# Или запустить конкретные фреймворки
bun run bench nestelia elysia fastify
```

## Почему Nestelia быстрый?

Nestelia выполняет всё внедрение зависимостей, связывание модулей и регистрацию маршрутов **на этапе запуска**. Во время обработки запросов простые хендлеры вызывают методы сервисов напрямую — без цепочки middleware, без поиска по контейнеру, без рефлексии.

| | Nestelia | NestJS |
|---|---|---|
| Рантайм | Bun | Node.js |
| HTTP слой | Elysia | Express (по умолчанию) |
| DI разрешение | На этапе запуска | На этапе запуска |
| Рефлексия метаданных | Кэшируется при старте | На каждый запрос |
| Request context | Fast path пропускает | Всегда создаётся |
| Цепочка middleware | Нет (обработчики Elysia) | Стек middleware Express |
| Валидация | Elysia TypeBox (на этапе компиляции) | class-validator (рефлексия в рантайме) |
