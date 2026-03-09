---
title: Passport
icon: key
description: Аутентификация с помощью стратегий Passport.js
---

Пакет Passport интегрирует стратегии аутентификации Passport.js в систему guard nestelia.

## Установка

```bash
bun add passport
# Плюс выбранная стратегия
bun add passport-jwt
bun add passport-local
```

## PassportStrategy

Создайте стратегию, расширив миксин `PassportStrategy`:

```typescript
import { Injectable } from "nestelia";
import { PassportStrategy } from "nestelia/passport";
import { Strategy, ExtractJwt } from "passport-jwt";

@Injectable()
class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: "my-secret",
    });
  }

  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

Метод `validate()` вызывается после того, как стратегия проверила учётные данные. Его возвращаемое значение прикрепляется к запросу как `request.user`.

## AuthGuard

Используйте `AuthGuard` для защиты маршрутов с конкретной стратегией:

```typescript
import { Controller, Get } from "nestelia";
import { AuthGuard } from "nestelia/passport";

@Controller("/profile")
class ProfileController {
  @Get("/")
  @UseGuards(AuthGuard("jwt"))
  getProfile(@Req() req: any) {
    return req.user;
  }
}
```

## Пример Local Strategy

```typescript
@Injectable()
class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(@Inject(AuthService) private authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }
    return user;
  }
}

@Controller("/auth")
class AuthController {
  @Post("/login")
  @UseGuards(AuthGuard("local"))
  login(@Req() req: any) {
    return { token: this.authService.generateToken(req.user) };
  }
}
```

## Несколько стратегий

`AuthGuard` принимает массив имён стратегий. Запрос аутентифицируется, если любая из стратегий успешна:

```typescript
@UseGuards(AuthGuard(["jwt", "api-key"]))
```

## Регистрация стратегий

Включите provider стратегии в ваш module:

```typescript
@Module({
  providers: [JwtStrategy, LocalStrategy, AuthService],
  controllers: [AuthController, ProfileController],
})
class AuthModule {}
```