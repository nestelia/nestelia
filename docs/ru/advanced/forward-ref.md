---
title: Forward References
icon: link
description: Разрешение циклических зависимостей с помощью forwardRef()
---

Циклические зависимости возникают, когда два service зависят друг от друга. nestelia предоставляет `forwardRef()` для обработки таких случаев.

## Проблема

```typescript
// Это создаёт циклическую зависимость:
@Injectable()
class ServiceA {
  constructor(@Inject(ServiceB) private b: ServiceB) {}
}

@Injectable()
class ServiceB {
  constructor(@Inject(ServiceA) private a: ServiceA) {}
}
```

При разрешении `ServiceA` требует `ServiceB`, который требует `ServiceA` — тупик.

## Решение

Используйте `forwardRef()` хотя бы на одной стороне циклической ссылки:

```typescript
import { Injectable, Inject, forwardRef } from "nestelia";

@Injectable()
class ServiceA {
  constructor(
    @Inject(forwardRef(() => ServiceB)) private b: ServiceB
  ) {}
}

@Injectable()
class ServiceB {
  constructor(@Inject(ServiceA) private a: ServiceA) {}
}
```

`forwardRef(() => ServiceB)` откладывает разрешение `ServiceB` до тех пор, пока все providers не будут зарегистрированы, разрывая циклическую цепочку.

## Когда использовать forwardRef

- Два service, ссылающиеся друг на друга
- Service, ссылающийся на controller, и наоборот
- Циклические импорты между modules

## Лучшие практики

Циклические зависимости часто указывают на проблему в проектировании. Прежде чем прибегать к `forwardRef()`, рассмотрите следующие варианты:

1. **Вынесите общую логику** в третий service, от которого будут зависеть оба
2. **Используйте события** — один service публикует, другой подписывается
3. **Реструктурируйте modules** — перенесите общие providers в общий module

Используйте `forwardRef()` только тогда, когда рефакторинг нецелесообразен.