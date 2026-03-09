---
title: Bootstrap
icon: power
description: Инициализация и запуск nestelia-приложения
---

Функция `createElysiaApplication` инициализирует корневой module и возвращает экземпляр Elysia, готовый к прослушиванию запросов.

## Базовое использование

```typescript
import { createElysiaApplication } from "nestelia";

const app = await createElysiaApplication(AppModule);
app.listen(3000);
```

## Что делает createElysiaApplication

1. **Разрешает дерево modules** — рекурсивно обрабатывает imports, providers и controllers
2. **Регистрирует providers** — добавляет всех providers в DI container
3. **Инстанциирует controllers** — создаёт экземпляры controllers с инжектированными зависимостями
4. **Регистрирует маршруты** — связывает декорированные методы с маршрутами Elysia
5. **Запускает lifecycle hooks** — вызывает `onModuleInit` и `onApplicationBootstrap` по порядку
6. **Возвращает ElysiaNestApplication** — готовый к вызову `.listen()`

## С Microservices

При использовании пакета microservices `createElysiaApplication` возвращает `ElysiaNestApplication`, поддерживающий гибридный режим HTTP + microservice:

```typescript
import { createElysiaApplication } from "nestelia";
import { Transport } from "nestelia/microservices";

const app = await createElysiaApplication(AppModule);

app.connectMicroservice({
  transport: Transport.REDIS,
  options: { host: "localhost", port: 6379 },
});

await app.startAllMicroservices();
app.listen(3000);
```

## Корректное завершение работы

nestelia поддерживает lifecycle hooks для завершения работы. Когда процесс получает сигнал завершения:

1. Сначала выполняются hooks `BeforeApplicationShutdown`
2. Затем для очистки выполняются hooks `OnModuleDestroy`
3. В последнюю очередь выполняются hooks `OnApplicationShutdown`

```typescript
@Injectable()
class DatabaseService implements OnModuleDestroy {
  async onModuleDestroy() {
    await this.connection.close();
  }
}
```