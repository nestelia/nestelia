---
title: Cache Manager
icon: database
description: Кэширование HTTP-ответов с декораторами
---

Пакет cache manager обеспечивает автоматическое кэширование HTTP-ответов с конфигурацией на основе декораторов.

## Установка

```bash
bun add cache-manager
```

## Настройка

```typescript
import { Module } from "nestelia";
import { CacheModule } from "nestelia/cache";

@Module({
  imports: [
    CacheModule.register({
      ttl: 60000, // TTL по умолчанию в миллисекундах (60 секунд)
    }),
  ],
})
class AppModule {}
```

### Асинхронная конфигурация

```typescript
import { CacheModule } from "nestelia/cache";

CacheModule.registerAsync({
  useFactory: async (config: ConfigService) => ({
    ttl: config.get("CACHE_TTL"),      // в миллисекундах
    store: config.get("CACHE_STORE"),  // "memory" или redis store
  }),
  inject: [ConfigService],
})
```

## Декораторы

### @CacheKey()

Задание пользовательского ключа кэша для маршрута:

```typescript
import { CacheKey } from "nestelia/cache";

@Controller("/users")
class UserController {
  @Get("/")
  @CacheKey("all-users")
  findAll() {
    return this.userService.findAll();
  }
}
```

Динамические ключи кэша с использованием factory-функции:

```typescript
import { CacheKey } from "nestelia/cache";

@Get("/:id")
@CacheKey((context: ExecutionContext) => {
  const ctx = context.switchToHttp().getRequest<any>();
  return `user-${ctx.params.id}`;
})
findOne(@Ctx() ctx: any) {
  return this.userService.findById(ctx.params.id);
}
```

### @CacheTTL()

Переопределение TTL по умолчанию для конкретного маршрута. Значение указывается в **миллисекундах**:

```typescript
import { CacheTTL } from "nestelia/cache";

@Get("/stats")
@CacheTTL(300000) // кэшировать на 5 минут (300 000 мс)
getStats() {
  return this.statsService.compute();
}
```

Динамический TTL:

```typescript
@Get("/data")
@CacheTTL((context: ExecutionContext) => {
  const ctx = context.switchToHttp().getRequest<any>();
  // более короткий кэш для аутентифицированных пользователей
  return ctx.user ? 30000 : 300000;
})
getData() {
  return this.dataService.fetch();
}
```

## CacheInterceptor

Применяйте `CacheInterceptor` для автоматического кэширования ответов:

```typescript
import { CacheInterceptor } from "nestelia/cache";

@Controller("/products")
@UseInterceptors(CacheInterceptor)
class ProductController {
  @Get("/")
  @CacheTTL(120000) // 2 минуты
  findAll() {
    return this.productService.findAll();
  }
}
```

## Инжектирование Cache Manager

Инжектируйте экземпляр кэша напрямую для ручных операций с кэшем:

```typescript
import { Injectable, Inject } from "nestelia";
import { CACHE_MANAGER, Cache } from "nestelia/cache";

@Injectable()
class UserService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async findAll() {
    const cached = await this.cache.get("all-users");
    if (cached) return cached;

    const users = await this.db.users.findMany();
    await this.cache.set("all-users", users, 60000); // 60 секунд
    return users;
  }
}
```

## Cache Stores

- **In-memory** — по умолчанию, без дополнительных зависимостей
- **Redis** — для распределённого кэширования между несколькими экземплярами

```typescript
import { redisStore } from "cache-manager-redis-yet";

CacheModule.register({
  store: redisStore,
  host: "localhost",
  port: 6379,
  ttl: 60000,
})
```