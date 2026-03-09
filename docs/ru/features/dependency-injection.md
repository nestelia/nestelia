---
title: Dependency Injection
icon: plug
description: Constructor-based DI с несколькими scope-ами
---

nestelia предоставляет полноценную систему dependency injection. Services регистрируются в modules и автоматически инжектируются в controllers и другие services.

## @Injectable()

Пометьте класс как injectable, чтобы DI container мог им управлять:

```typescript
import { Injectable } from "nestelia";

@Injectable()
class UserService {
  findAll() {
    return [{ id: 1, name: "John" }];
  }
}
```

## @Inject()

Явно указывайте токен зависимости в конструкторе:

```typescript
@Controller("/users")
class UserController {
  constructor(@Inject(UserService) private readonly userService: UserService) {}
}
```

## @Optional()

Пометьте зависимость как опциональную — возвращает `undefined`, если недоступна:

```typescript
constructor(
  @Inject("ANALYTICS") @Optional() private analytics?: AnalyticsService
) {}
```

## Scopes

Управляйте жизненным циклом ваших services с помощью scopes:

```typescript
import { Injectable, Scope } from "nestelia";

// По умолчанию — один экземпляр на всё приложение
@Injectable()
class SingletonService {}

// Новый экземпляр при каждом инжектировании
@Injectable({ scope: Scope.TRANSIENT })
class TransientService {}

// Новый экземпляр для каждого HTTP-запроса (через AsyncLocalStorage)
@Injectable({ scope: Scope.REQUEST })
class RequestScopedService {}
```

| Scope | Поведение |
|-------|----------|
| `SINGLETON` | Единственный экземпляр на всё приложение (по умолчанию) |
| `TRANSIENT` | Новый экземпляр при каждом инжектировании |
| `REQUEST` | Новый экземпляр для каждого HTTP-запроса |

## Регистрация Providers

Providers регистрируются в массиве `providers` module:

```typescript
@Module({
  controllers: [UserController],
  providers: [UserService, DatabaseService],
})
class UserModule {}
```

## Экспорт Providers

Чтобы сделать provider доступным для других modules, добавьте его в `exports`:

```typescript
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
class DatabaseModule {}

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService], // может инжектировать DatabaseService
})
class UserModule {}
```

## Custom Providers

Смотрите страницу [Custom Providers](/advanced/custom-providers) для ознакомления с value, class, factory и alias провайдерами.

## Циклические зависимости

Смотрите страницу [Forward References](/advanced/forward-ref) для разрешения циклических зависимостей с помощью `forwardRef()`.