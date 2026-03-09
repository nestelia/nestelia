---
title: Container API
icon: box
description: Прямой доступ к DI container для продвинутых сценариев
---

Синглтон `DIContainer` предоставляет низкоуровневый доступ к системе dependency injection. Большинство приложений не нуждаются в нём напрямую, но он полезен для тестирования, динамических providers и расширений фреймворка.

## Получение экземпляра

```typescript
import { DIContainer } from "nestelia";

const service = await DIContainer.get(UserService, UserModule);
```

## Регистрация Providers

```typescript
DIContainer.register([
  UserService,
  { provide: "CONFIG", useValue: { port: 3000 } },
], MyModuleClass);
```

## Регистрация Controllers

```typescript
DIContainer.registerControllers([UserController, AdminController], MyModuleClass);
```

## Очистка Container

Полезно для изоляции тестов — удаляет все зарегистрированные modules и providers:

```typescript
import { beforeEach } from "bun:test";
import { DIContainer } from "nestelia";

beforeEach(() => {
  DIContainer.clear();
});
```

## Управление Modules

```typescript
// Добавить module
const moduleRef = DIContainer.addModule(MyModule, "MyModule");

// Получить module по ключу
const moduleRef = DIContainer.getModuleByKey("MyModule");

// Получить все modules
const modules = DIContainer.getModules();
```

## Request Scope

Container использует `AsyncLocalStorage` для управления request-scoped providers. При поступлении запроса:

1. `Container.runInRequestContext()` создаёт новый контекст
2. `REQUEST`-scoped providers получают свежий экземпляр для этого контекста
3. Контекст очищается после ответа

```typescript
@Injectable({ scope: Scope.REQUEST })
class RequestLogger {
  private requestId = crypto.randomUUID();

  log(message: string) {
    console.log(`[${this.requestId}] ${message}`);
  }
}
```

## Разрешение ключей Module

Providers привязаны к modules. При вызове `DIContainer.get()` передайте класс module для поиска providers внутри конкретного module:

```typescript
const service = await DIContainer.get(UserService, UserModule);
```

Если пропущен, container выполняет поиск во всех modules.

## Глобальные Modules

```typescript
// Пометить module как глобальный, чтобы его providers были доступны везде
const moduleRef = DIContainer.addModule(ConfigModule, "ConfigModule");
DIContainer.addGlobalModule(moduleRef);
DIContainer.bindGlobalScope();
```