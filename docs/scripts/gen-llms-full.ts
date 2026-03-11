/**
 * Generates /public/llms-full.txt — a single-file concatenation of all
 * English documentation pages, for LLM crawlers that prefer one file.
 * Run before vitepress build.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const DOCS_ROOT = new URL("..", import.meta.url).pathname;
const OUT_FILE  = join(DOCS_ROOT, "public", "llms-full.txt");

// Sections in order — only English (root-level) pages
const SECTIONS = [
  "introduction.md",
  "getting-started/installation.md",
  "getting-started/quick-start.md",
  "core-concepts/modules.md",
  "core-concepts/controllers.md",
  "core-concepts/bootstrap.md",
  "features/http-decorators.md",
  "features/parameter-decorators.md",
  "features/dependency-injection.md",
  "features/lifecycle-hooks.md",
  "features/middleware.md",
  "features/exception-handling.md",
  "features/guards.md",
  "features/interceptors.md",
  "features/pipes.md",
  "packages/overview.md",
  "packages/scheduler.md",
  "packages/microservices.md",
  "packages/apollo.md",
  "packages/passport.md",
  "packages/testing.md",
  "packages/cache.md",
  "packages/rabbitmq.md",
  "packages/graphql-pubsub.md",
  "packages/drizzle.md",
  "packages/event-emitter.md",
  "advanced/custom-providers.md",
  "advanced/forward-ref.md",
  "advanced/container-api.md",
  "advanced/swagger.md",
];

const parts: string[] = [
  "# Nestelia — Full Documentation\n",
  "> This file contains the complete Nestelia documentation in a single page.\n",
  "> For the structured index see https://nestelia.dev/llms.txt\n",
  "",
];

for (const rel of SECTIONS) {
  const abs = join(DOCS_ROOT, rel);
  try {
    let content = readFileSync(abs, "utf8");
    // Strip frontmatter
    content = content.replace(/^---[\s\S]*?---\n?/, "").trim();
    parts.push(`\n---\n<!-- Source: ${rel} -->\n`);
    parts.push(content);
  } catch {
    console.warn(`[gen-llms-full] skipped missing file: ${rel}`);
  }
}

writeFileSync(OUT_FILE, parts.join("\n"), "utf8");
console.log(`[gen-llms-full] wrote ${OUT_FILE}`);
