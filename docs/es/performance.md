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
  methodology="Medido en solicitudes/segundo. GET / → texto plano 'Hello World'. 500 conexiones, 10 segundos de duración."
/>

## Cómo reproducir

```bash
# Instalar dependencias del benchmark
cd benchmark && bun install && cd ..

# Instalar herramienta de prueba de carga
brew install bombardier

# Ejecutar todos los benchmarks
bun benchmark/run.ts

# O ejecutar frameworks específicos
bun benchmark/run.ts nestelia elysia fastify
```

## ¿Por qué Nestelia es rápido?

Nestelia resuelve toda la inyección de dependencias, el cableado de módulos y el registro de rutas **en tiempo de inicio**. En tiempo de solicitud, los controladores llaman a los métodos de servicio directamente — sin cadena de middleware, sin búsquedas en el contenedor por solicitud.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Capa HTTP | Elysia | Express (por defecto) |
| Resolución DI | En tiempo de inicio | En tiempo de inicio |
| Cadena de middleware | Ninguna (handlers de Elysia) | Stack de middleware de Express |
| Validación | Elysia TypeBox (compilación) | class-validator (reflexión en runtime) |
