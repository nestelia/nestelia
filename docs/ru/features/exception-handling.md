---
title: Exception Handling
icon: circle-alert
description: Обрабатывайте ошибки с помощью встроенных HTTP-исключений
---

nestelia предоставляет встроенные классы исключений, которые автоматически генерируют структурированные ответы об ошибках.

## Встроенные исключения

```typescript
import {
  HttpException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from "nestelia";
```

## Использование

Выбрасывайте исключения из методов controller или services:

```typescript
@Get("/:id")
async findOne(@Ctx() ctx: any) {
  const user = await this.userService.findById(ctx.params.id);
  if (!user) {
    throw new NotFoundException(`User ${ctx.params.id} not found`);
  }
  return user;
}
```

Фреймворк перехватывает исключение и возвращает:

```json
{
  "statusCode": 404,
  "message": "User 123 not found"
}
```

## HttpException

Базовый класс для всех HTTP-исключений:

```typescript
throw new HttpException("Something went wrong", 500);

// Или с объектом ответа
throw new HttpException({ message: "Validation failed", errors: [] }, 422);
```

## Удобные исключения

| Исключение | Статус-код |
|-----------|-------------|
| `BadRequestException` | 400 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |

## Пользовательские исключения

Расширьте `HttpException` для создания собственных исключений:

```typescript
class ValidationException extends HttpException {
  constructor(errors: string[]) {
    super({ message: "Validation failed", errors }, 422);
  }
}

class PaymentRequiredException extends HttpException {
  constructor() {
    super("Payment required", 402);
  }
}
```

## Exception Filters

Exception filters позволяют перехватывать и преобразовывать выброшенные исключения на глобальном уровне.

### Определение Filter

Реализуйте интерфейс `ExceptionFilter` и используйте `@Catch()` для указания типов исключений, которые нужно обрабатывать:

```typescript
import { Catch, ExceptionFilter, ExceptionContext, HttpException } from "nestelia";

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, context: ExceptionContext) {
    return {
      statusCode: exception.getStatus(),
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: context.path,
    };
  }
}
```

Используйте `@Catch()` без аргументов для перехвата всех ошибок:

```typescript
@Catch()
class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: Error, context: ExceptionContext) {
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    return {
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString(),
    };
  }
}
```

### Регистрация Filters

Зарегистрируйте глобальный exception filter с помощью токена `APP_FILTER` в массиве `providers` корневого module:

```typescript
import { Module, APP_FILTER } from "nestelia";

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
class AppModule {}
```

### ExceptionContext

Объект контекста, передаваемый в `catch()`, содержит:

```typescript
interface ExceptionContext {
  request: Request;
  response: any;
  set: { status: number; headers: Record<string, string> };
  path: string;
  method: string;
}
```