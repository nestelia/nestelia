---
title: Controllers
icon: server
description: Определяйте HTTP-обработчики маршрутов с помощью декораторов
---

Controllers обрабатывают входящие HTTP-запросы и возвращают ответы. Они помечаются декоратором `@Controller()` и используют HTTP-декораторы для определения маршрутов.

## Объявление Controller

```typescript
import { Controller, Get } from "nestelia";

@Controller("/cats")
class CatController {
  @Get("/")
  findAll() {
    return [{ name: "Tom" }, { name: "Garfield" }];
  }
}
```

Декоратор `@Controller("/cats")` задаёт префикс маршрута. Декоратор `@Get("/")` связывает `GET /cats/` с методом `findAll()`.

## Регистрация Controllers

Controllers должны быть объявлены в module:

```typescript
@Module({
  controllers: [CatController],
  providers: [CatService],
})
class CatModule {}
```

## Инжектирование Services

Используйте `@Inject()` в конструкторе для получения доступа к services из DI container:

```typescript
@Controller("/cats")
class CatController {
  constructor(@Inject(CatService) private readonly catService: CatService) {}

  @Get("/")
  findAll() {
    return this.catService.findAll();
  }
}
```

## Методы маршрутов

nestelia предоставляет decorators для всех стандартных HTTP-методов:

```typescript
@Controller("/items")
class ItemController {
  @Get("/")       findAll() { /* ... */ }
  @Get("/:id")    findOne() { /* ... */ }
  @Post("/")      create()  { /* ... */ }
  @Put("/:id")    update()  { /* ... */ }
  @Patch("/:id")  patch()   { /* ... */ }
  @Delete("/:id") remove()  { /* ... */ }
  @Options("/")   options() { /* ... */ }
  @Head("/")      head()    { /* ... */ }
  @All("/wild")   any()     { /* ... */ }
}
```

## Возврат ответов

Методы controller могут возвращать:

- **Обычные объекты / массивы** — автоматически сериализуются в JSON
- **Строки** — возвращаются как обычный текст
- **Promises** — ожидаются и затем сериализуются

```typescript
@Get("/")
async findAll() {
  const users = await this.userService.findAll();
  return users; // сериализуется в JSON
}
```

## Доступ к данным запроса

Используйте `@Ctx()` для получения полного контекста Elysia, который предоставляет доступ ко всем данным запроса:

```typescript
@Get("/:id")
findOne(@Ctx() ctx: any) {
  const id = ctx.params.id;
  const q = ctx.query.q;
  return this.service.findById(id);
}
```

Для типизированного и валидированного доступа к body, params и query используйте TypeBox-декораторы:

```typescript
import { t } from "elysia";

@Post("/")
create(@Body(t.Object({ name: t.String() })) body: { name: string }) {
  return this.userService.create(body);
}
```

Подробности смотрите в разделе [Parameter Decorators](/features/parameter-decorators).

## Установка статус-кодов

Используйте `@HttpCode()` для задания пользовательского статус-кода маршрута:

```typescript
@Post("/")
@HttpCode(201)
create(@Body(t.Object({ name: t.String() })) body: { name: string }) {
  return this.userService.create(body);
}
```

Или используйте контекст Elysia для динамических статус-кодов:

```typescript
@Post("/")
create(@Ctx() ctx: any, @Body(t.Object({ name: t.String() })) body: { name: string }) {
  ctx.set.status = 201;
  return this.userService.create(body);
}
```

## Установка заголовков ответа

Используйте `@Header()` для добавления статических заголовков ответа:

```typescript
@Get("/")
@Header("Cache-Control", "no-store")
findAll() {
  return this.service.findAll();
}
```