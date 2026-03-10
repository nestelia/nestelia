---
title: Event Emitter
icon: zap
description: Emisor de eventos tipado con soporte de wildcards e inyección de dependencias
---

El módulo Event Emitter proporciona un sistema de eventos tipado y asíncrono con soporte opcional para patrones wildcard. Los métodos decorados con `@OnEvent()` son descubiertos y registrados automáticamente durante el bootstrap, sin necesidad de registro manual.

## Instalación

No se necesitan dependencias adicionales — el módulo está incluido en `nestelia`.

## Configuración

```typescript
import { Module } from "nestelia";
import { EventEmitterModule } from "nestelia/event-emitter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,  // habilitar patrones "order.*" y "**"
      global: true,    // hacer EventEmitterService disponible globalmente
    }),
  ],
})
export class AppModule {}
```

## Emitiendo eventos

Inyecta `EventEmitterService` y llama a `emitAsync` (espera todos los handlers) o `emit` (dispara y olvida):

```typescript
import { Injectable } from "nestelia";
import { EventEmitterService } from "nestelia/event-emitter";

@Injectable()
export class OrdersService {
  constructor(private readonly events: EventEmitterService) {}

  async placeOrder(order: Order) {
    await this.events.emitAsync("order.created", order);
    return order;
  }
}
```

## Escuchando eventos

Añade `@OnEvent()` a cualquier método de cualquier proveedor `@Injectable()`. El módulo escanea todos los proveedores durante `onApplicationBootstrap` y registra los handlers automáticamente.

```typescript
import { Injectable } from "nestelia";
import { OnEvent } from "nestelia/event-emitter";

@Injectable()
export class NotificationListener {
  @OnEvent("order.created")
  handleOrderCreated(order: Order) {
    console.log("Nuevo pedido:", order.id);
  }

  @OnEvent("order.*")
  handleAnyOrderEvent(order: Order) {
    console.log("Evento de pedido disparado");
  }
}
```

## Patrones wildcard

Habilita `wildcard: true` en `forRoot` para usar patrones estilo glob:

| Patrón | Coincide con |
|--------|-------------|
| `order.*` | `order.created`, `order.shipped` … |
| `**` | todos los eventos |

## Opciones de configuración

| Opción | Tipo | Por defecto | Descripción |
|--------|------|-------------|-------------|
| `wildcard` | `boolean` | `false` | Habilitar coincidencia wildcard |
| `delimiter` | `string` | `"."` | Delimitador de namespace |
| `maxListeners` | `number` | `10` | Máximo de listeners por evento |
| `global` | `boolean` | `false` | Registrar como módulo global |

## Exportaciones

| Exportación | Descripción |
|-------------|-------------|
| `EventEmitterModule` | Clase del módulo |
| `EventEmitterService` | Servicio de emisor de eventos inyectable |
| `OnEvent(event, opts?)` | Decorador de método para handlers |
| `InjectEventEmitter()` | Atajo para decorador de parámetro |
| `EVENT_EMITTER_TOKEN` | Token de inyección |
