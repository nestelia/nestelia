---
title: Custom Providers
icon: puzzle
description: Value, class, factory и alias providers
---

Помимо простых class providers, nestelia поддерживает несколько типов custom providers для сложных сценариев dependency injection.

## Class Providers

Простейшая форма — DI container инстанциирует класс:

```typescript
@Module({
  providers: [UserService], // сокращение для { provide: UserService, useClass: UserService }
})
class AppModule {}
```

Также можно заменить один класс другим:

```typescript
@Module({
  providers: [
    { provide: DatabaseService, useClass: PostgresService },
  ],
})
class AppModule {}
```

## Value Providers

Предоставление статического значения (объект, строка, число и т.д.):

```typescript
@Module({
  providers: [
    { provide: "CONFIG", useValue: { port: 3000, debug: true } },
    { provide: "API_KEY", useValue: "sk-abc123" },
  ],
})
class AppModule {}
```

Инжектирование со строковым токеном:

```typescript
@Injectable()
class ApiService {
  constructor(@Inject("API_KEY") private apiKey: string) {}
}
```

## Factory Providers

Использование функции для создания экземпляра provider. Функция может инжектировать другие зависимости:

```typescript
@Module({
  providers: [
    ConfigService,
    {
      provide: "DATABASE",
      useFactory: (config: ConfigService) => {
        return createDatabaseConnection(config.get("DATABASE_URL"));
      },
      inject: [ConfigService],
    },
  ],
})
class AppModule {}
```

Асинхронные factories поддерживаются:

```typescript
{
  provide: "DATABASE",
  useFactory: async (config: ConfigService) => {
    const connection = await createConnection(config.get("DATABASE_URL"));
    await connection.migrate();
    return connection;
  },
  inject: [ConfigService],
}
```

## Alias Providers (useExisting)

Создание псевдонима, указывающего на существующий provider:

```typescript
@Module({
  providers: [
    PostgresService,
    { provide: "DATABASE", useExisting: PostgresService },
  ],
})
class AppModule {}
```

Оба `PostgresService` и `"DATABASE"` разрешаются в один и тот же singleton-экземпляр.

## Комбинирование типов providers

```typescript
@Module({
  providers: [
    // Class
    UserService,
    AuthService,

    // Value
    { provide: "CONFIG", useValue: { port: 3000 } },

    // Factory
    {
      provide: "LOGGER",
      useFactory: (config: any) => new Logger(config.level),
      inject: ["CONFIG"],
    },

    // Подмена класса
    { provide: DatabaseService, useClass: PostgresService },

    // Alias
    { provide: "DB", useExisting: DatabaseService },
  ],
})
class AppModule {}
```

## Экспорт Custom Providers

Чтобы сделать custom providers доступными для других modules:

```typescript
@Module({
  providers: [
    { provide: "CONFIG", useValue: { port: 3000 } },
    ConfigService,
  ],
  exports: ["CONFIG", ConfigService],
})
class SharedModule {}
```