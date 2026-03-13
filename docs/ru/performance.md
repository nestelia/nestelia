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
  methodology="Измерено в запросах/секунду. GET / → plain text 'Hello World'. 500 соединений, 10 секунд."
/>

## Как воспроизвести

```bash
# Установить зависимости бенчмарка
cd benchmark && bun install && cd ..

# Установить инструмент нагрузочного тестирования
brew install bombardier

# Запустить все бенчмарки
bun benchmark/run.ts

# Или запустить конкретные фреймворки
bun benchmark/run.ts nestelia elysia fastify
```

## Почему Nestelia быстрый?

Nestelia выполняет всё внедрение зависимостей, связывание модулей и регистрацию маршрутов **на этапе запуска**. Во время обработки запросов контроллеры вызывают методы сервисов напрямую — без цепочки middleware, без поиска по контейнеру на каждый запрос.

| | Nestelia | NestJS |
|---|---|---|
| Рантайм | Bun | Node.js |
| HTTP слой | Elysia | Express (по умолчанию) |
| DI разрешение | На этапе запуска | На этапе запуска |
| Цепочка middleware | Нет (обработчики Elysia) | Стек middleware Express |
| Валидация | Elysia TypeBox (на этапе компиляции) | class-validator (рефлексия в рантайме) |
