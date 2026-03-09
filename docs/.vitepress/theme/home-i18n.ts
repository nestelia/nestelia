import { useData } from "vitepress";
import { computed } from "vue";

// ── Translations ──────────────────────────────────────────────────────────────

const messages = {
  "en-US": {
    pill: { released: "released", github: "View on GitHub" },
    tagline: ["Modular framework for Elysia and Bun.", "Decorators · DI · Modules · Elysia speed."],
    cta: { start: "Get Started", quick: "Quick Start →" },
    links: { intro: "/introduction", quick: "/getting-started/quick-start" },
    copy: { idle: "Copy", done: "Copied!" },
    ecosystem: {
      title: "Ecosystem",
      sub: "Optional packages — install only what you need.",
    },
    packages: {
      Scheduler: "@Cron, @Interval, @Timeout — task scheduling powered by node-cron.",
      Microservices: "TCP and Redis transports with @MessagePattern and @EventPattern.",
      "Apollo / GraphQL": "Code-first GraphQL with @Resolver, @Query, @Mutation, @Subscription.",
      Passport: "AuthGuard and PassportStrategy — drop-in authentication strategies.",
      Cache: "CacheModule with @CacheKey, @CacheTTL and pluggable cache stores.",
      RabbitMQ: "@RabbitSubscribe and @RabbitRPC over AMQP via amqplib.",
      Testing: "Test.createTestingModule — isolated module testing with mock providers.",
      "GraphQL PubSub": "Redis-backed PubSub for real-time GraphQL subscriptions.",
    },
    showcase: [
      {
        title: "Decorator-driven Routing",
        paragraphs: [
          "@Controller, @Get, @Post, @Body and more — a clean, declarative decorator API running natively on Elysia.",
          "Nestelia maps each decorated route directly to an Elysia handler, giving you full type inference and schema validation at the framework layer.",
        ],
      },
      {
        title: "Dependency Injection",
        paragraphs: [
          "Constructor-based DI with singleton, transient, and request scopes powered by reflect-metadata.",
          "Mark any class with @Injectable() and declare it as a provider — nestelia resolves the full dependency graph automatically at bootstrap.",
        ],
      },
      {
        title: "Modular Architecture",
        paragraphs: [
          "Encapsulate controllers, providers, and imports into cohesive, reusable modules with a clear, explicit structure.",
          "One call to createElysiaApplication wires up the entire dependency graph and returns a ready Elysia instance.",
        ],
      },
    ],
  },

  "ru-RU": {
    pill: { released: "выпущена", github: "Смотреть на GitHub" },
    tagline: [
      "Модульный фреймворк для Elysia и Bun.",
      "Декораторы · DI · Модули · Скорость Elysia.",
    ],
    cta: { start: "Начать", quick: "Быстрый старт →" },
    links: { intro: "/ru/introduction", quick: "/ru/getting-started/quick-start" },
    copy: { idle: "Копировать", done: "Скопировано!" },
    ecosystem: {
      title: "Экосистема",
      sub: "Опциональные пакеты — устанавливайте только нужное.",
    },
    packages: {
      Scheduler: "@Cron, @Interval, @Timeout — планирование задач на базе node-cron.",
      Microservices: "Транспорты TCP и Redis с @MessagePattern и @EventPattern.",
      "Apollo / GraphQL": "Code-first GraphQL с @Resolver, @Query, @Mutation, @Subscription.",
      Passport: "AuthGuard и PassportStrategy — готовые стратегии аутентификации.",
      Cache: "CacheModule с @CacheKey, @CacheTTL и подключаемыми хранилищами.",
      RabbitMQ: "@RabbitSubscribe и @RabbitRPC через AMQP с amqplib.",
      Testing: "Test.createTestingModule — изолированное тестирование с mock-провайдерами.",
      "GraphQL PubSub": "Redis PubSub для real-time GraphQL subscriptions.",
    },
    showcase: [
      {
        title: "Маршрутизация на декораторах",
        paragraphs: [
          "@Controller, @Get, @Post, @Body и другие — декларативный API, работающий нативно на Elysia.",
          "nestelia напрямую связывает каждый декорированный маршрут с обработчиком Elysia, обеспечивая вывод типов и валидацию схем.",
        ],
      },
      {
        title: "Dependency Injection",
        paragraphs: [
          "Constructor-based DI с singleton, transient и request scope-ами на базе reflect-metadata.",
          "Пометьте класс @Injectable() и объявите его провайдером — nestelia автоматически разрешит весь граф зависимостей при старте.",
        ],
      },
      {
        title: "Модульная архитектура",
        paragraphs: [
          "Инкапсулируйте controllers, providers и imports в целостные переиспользуемые модули с явной структурой.",
          "Один вызов createElysiaApplication собирает весь граф зависимостей и возвращает готовый экземпляр Elysia.",
        ],
      },
    ],
  },
} as const;

type Messages = (typeof messages)["en-US"];

// ── Composable ────────────────────────────────────────────────────────────────

export function useHomeI18n() {
  const { lang } = useData();
  return computed(
    () => (messages[lang.value as keyof typeof messages] ?? messages["en-US"]) as Messages,
  );
}
