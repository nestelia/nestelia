---
title: Rendimiento
description: Resultados de benchmark de Nestelia comparados con NestJS, Express y Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Rendimiento

Nestelia agrega una capa delgada de decoradores e inyección de dependencias sobre Elysia — con casi cero overhead. El resultado: experiencia de desarrollo estilo NestJS a la velocidad de Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Promedio de reqs/s en 5 escenarios. 500 conexiones, 10s por escenario. macOS arm64, Bun 1.3, Node 24."
/>

## Resultados por escenario

| Escenario | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Service** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **Promedio** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## Cómo reproducir

```bash
# Instalar dependencias del benchmark
cd benchmark && bun install && cd ..

# Instalar herramienta de prueba de carga
brew install bombardier

# Ejecutar todos los benchmarks (5 escenarios × 5 frameworks)
bun run bench

# O ejecutar frameworks específicos
bun run bench nestelia elysia fastify
```

## ¿Por qué Nestelia es rápido?

Nestelia resuelve toda la inyección de dependencias, el cableado de módulos y el registro de rutas **en tiempo de inicio**. En tiempo de solicitud, los controladores llaman a los métodos de servicio directamente — sin cadena de middleware, sin búsquedas en el contenedor por solicitud.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Capa HTTP | Elysia | Express (por defecto) |
| Resolución DI | En tiempo de inicio | En tiempo de inicio |
| Reflexión de metadatos | Cache en inicio | Por solicitud |
| Contexto de solicitud | Ruta rápida lo omite | Siempre creado |
| Cadena de middleware | Ninguna (handlers de Elysia) | Stack de middleware de Express |
| Validación | Elysia TypeBox (compilación) | class-validator (reflexión en runtime) |
