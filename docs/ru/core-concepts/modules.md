---
title: Modules
icon: boxes
description: Организуйте приложение в целостные блоки
---

Modules — основной способ организации nestelia-приложения. Каждый module инкапсулирует набор controllers, providers и imports.

## Объявление Module

Используйте декоратор `@Module()` для объявления module:

```typescript
import { Module } from "nestelia";

@Module({
  controllers: [UserController],
  providers: [UserService],
})
class UserModule {}
```

## Параметры Module

```typescript
interface ModuleOptions {
  controllers?: Type[];        // Обработчики маршрутов
  providers?: Provider[];      // Injectable-сервисы
  imports?: any[];             // Другие modules для импорта
  exports?: ProviderToken[];   // Providers, доступные импортирующим modules
  middlewares?: Middleware[];   // Class-based или функциональный middleware
  children?: (() => Promise<any>)[]; // Дочерние modules
  prefix?: string;             // Префикс маршрута для всех controllers
}
```

## Импорт Modules

Modules могут импортировать другие modules для доступа к их экспортированным providers:

```typescript
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
class DatabaseModule {}

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserService],
})
class UserModule {}
```

`UserService` теперь может инжектировать `DatabaseService`, поскольку `DatabaseModule` его экспортирует.

## Корневой Module

Каждое приложение имеет корневой module, передаваемый в `createElysiaApplication()`:

```typescript
@Module({
  imports: [UserModule, AuthModule, DatabaseModule],
})
class AppModule {}

const app = await createElysiaApplication(AppModule);
```

## Префикс Module

Задайте префикс маршрута для всех controllers внутри module:

```typescript
@Module({
  controllers: [UserController], // маршруты становятся /api/v1/users/...
  prefix: "/api/v1",
})
class ApiModule {}
```

## Глобальные Modules

Пометьте module как глобальный, чтобы его providers были доступны везде без явного импорта:

```typescript
import { Global, Module } from "nestelia";

@Global()
@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
class ConfigModule {}
```

## Динамические Modules

Modules могут предоставлять статические конфигурационные методы, такие как `forRoot()` и `forRootAsync()`:

```typescript
@Module({})
class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      providers: [
        { provide: "CONFIG_OPTIONS", useValue: options },
        ConfigService,
      ],
      exports: [ConfigService],
    };
  }
}

// Использование
@Module({
  imports: [ConfigModule.forRoot({ path: ".env" })],
})
class AppModule {}
```

## Как это работает

Под капотом `@Module()` создаёт плагин Elysia. При вызове `createElysiaApplication()`:

1. DI container регистрирует всех providers из module
2. Controllers инстанциируются с разрешёнными зависимостями
3. HTTP-маршруты регистрируются на экземпляре Elysia
4. Lifecycle hooks вызываются по порядку