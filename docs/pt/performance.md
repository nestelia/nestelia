---
title: Performance
description: Resultados de benchmark do Nestelia comparados com NestJS, Express e Fastify
---

<script setup>
import PerformanceChart from '../.vitepress/theme/PerformanceChart.vue'
import { benchmarkResults } from '../.vitepress/theme/benchmark-data'
</script>

# Performance

Nestelia adiciona uma camada fina de decoradores e injeção de dependência sobre o Elysia — com overhead quase zero. O resultado: experiência de desenvolvimento estilo NestJS na velocidade do Elysia.

<PerformanceChart
  :results="benchmarkResults"
  compare-to="Nestelia"
  methodology="Média de reqs/s em 5 cenários. 500 conexões, 10s por cenário. macOS arm64, Bun 1.3, Node 24."
/>

## Resultados por cenário

| Cenário | Nestelia | Elysia | Fastify | Express | NestJS |
|---|---:|---:|---:|---:|---:|
| **Plain Text** GET / | 74,914 | 79,287 | 47,600 | 40,385 | 38,413 |
| **JSON** GET /json | 73,438 | 76,925 | 45,010 | 38,807 | 36,527 |
| **Path Params** GET /user/:id | 74,289 | 75,077 | 45,747 | 38,250 | 27,598 |
| **POST JSON** POST /user | 62,399 | 63,487 | 29,793 | 34,038 | 24,833 |
| **DI + Service** GET /users | 73,476 | 77,197 | 45,051 | 37,647 | 25,539 |
| **Média** | **71,703** | **74,395** | **42,640** | **37,825** | **30,582** |

## Como reproduzir

```bash
# Instalar dependências do benchmark
cd benchmark && bun install && cd ..

# Instalar ferramenta de teste de carga
brew install bombardier

# Executar todos os benchmarks (5 cenários × 5 frameworks)
bun run bench

# Ou executar frameworks específicos
bun run bench nestelia elysia fastify
```

## Por que o Nestelia é rápido?

Nestelia resolve toda a injeção de dependência, conexão de módulos e registro de rotas **no momento da inicialização**. No momento da requisição, os controllers chamam métodos de serviço diretamente — sem cadeia de middleware, sem buscas no container por requisição.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Camada HTTP | Elysia | Express (padrão) |
| Resolução DI | Na inicialização | Na inicialização |
| Reflexão de metadados | Cache na inicialização | Por requisição |
| Contexto da requisição | Caminho rápido ignora | Sempre criado |
| Cadeia de middleware | Nenhuma (handlers Elysia) | Stack de middleware Express |
| Validação | Elysia TypeBox (compilação) | class-validator (reflexão em runtime) |
