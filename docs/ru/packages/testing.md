---
title: Testing
icon: beaker
description: Изолированные тестовые modules с подменой providers
---

Пакет testing предоставляет утилиты для unit- и интеграционного тестирования nestelia-приложений.

## Быстрый старт

```typescript
import { describe, expect, it, beforeAll } from "bun:test";
import { Injectable } from "nestelia";
import { Test, TestingModule } from "nestelia/testing";

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: "John" }];
  }
}

describe("UserService", () => {
  let module: TestingModule;
  let userService: UserService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    userService = module.get(UserService);
  });

  it("should return users", () => {
    expect(userService.getUsers()).toEqual([{ id: 1, name: "John" }]);
  });
});
```

## Мокирование зависимостей

### Подмена значением

```typescript
const mockDb = {
  query: () => [{ id: 1, name: "Mock User" }],
};

const module = await Test.createTestingModule({
  providers: [UserService, DatabaseService],
})
  .overrideProvider(DatabaseService)
  .useValue(mockDb)
  .compile();
```

### Подмена классом

```typescript
class MockDatabaseService {
  query() {
    return [{ id: 1, name: "Mock" }];
  }
}

const module = await Test.createTestingModule({
  providers: [UserService, DatabaseService],
})
  .overrideProvider(DatabaseService)
  .useClass(MockDatabaseService)
  .compile();
```

### Подмена factory

```typescript
const module = await Test.createTestingModule({
  providers: [UserService, DatabaseService],
})
  .overrideProvider(DatabaseService)
  .useFactory(() => ({
    query: () => [{ id: 1, name: "Factory Mock" }],
  }))
  .compile();
```

## Справочник API

### Test.createTestingModule(metadata)

Создаёт `TestingModuleBuilder`.

**Параметры:**
- `metadata` — конфигурация module (`providers`, `imports`, `controllers`)

### TestingModuleBuilder

| Метод | Описание |
|--------|-------------|
| `.overrideProvider(token)` | Начать подмену provider |
| `.useValue(value)` | Заменить статическим значением |
| `.useClass(metatype)` | Заменить другим классом |
| `.useFactory(factory, inject?)` | Заменить factory-функцией |
| `.compile()` | Собрать и вернуть `Promise<TestingModule>` |

### TestingModule

| Метод | Описание |
|--------|-------------|
| `.get<T>(token)` | Получить экземпляр provider (синхронно) |
| `.resolve<T>(token)` | Разрешить provider (асинхронно, для request-scoped) |
| `.has(token)` | Проверить, зарегистрирован ли provider |