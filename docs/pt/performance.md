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
  methodology="Medido em requisições/segundo. GET / → texto puro 'Hello World'. 500 conexões, 10 segundos de duração."
/>

## Como reproduzir

```bash
# Instalar dependências do benchmark
cd benchmark && bun install && cd ..

# Instalar ferramenta de teste de carga
brew install bombardier

# Executar todos os benchmarks
bun benchmark/run.ts

# Ou executar frameworks específicos
bun benchmark/run.ts nestelia elysia fastify
```

## Por que o Nestelia é rápido?

Nestelia resolve toda a injeção de dependência, conexão de módulos e registro de rotas **no momento da inicialização**. No momento da requisição, os controllers chamam métodos de serviço diretamente — sem cadeia de middleware, sem buscas no container por requisição.

| | Nestelia | NestJS |
|---|---|---|
| Runtime | Bun | Node.js |
| Camada HTTP | Elysia | Express (padrão) |
| Resolução DI | Na inicialização | Na inicialização |
| Cadeia de middleware | Nenhuma (handlers Elysia) | Stack de middleware Express |
| Validação | Elysia TypeBox (compilação) | class-validator (reflexão em runtime) |
