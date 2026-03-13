#!/usr/bin/env bun

import { spawn, execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

// ── Config ───────────────────────────────────────────────────────────────────

const DURATION = process.env.DURATION || "10s";
const CONNECTIONS = Number(process.env.CONNECTIONS) || 500;
const PORT = 3000;
const WARMUP_DURATION = "3s";
const WARMUP_CONNECTIONS = 50;
const ROOT = resolve(import.meta.dir, "..");
const BENCH_DIR = import.meta.dir;

// ── Types ────────────────────────────────────────────────────────────────────

interface Framework {
  name: string;
  runtime: string;
  cmd: string[];
  cwd: string;
  env?: Record<string, string>;
}

interface BenchResult {
  name: string;
  runtime: string;
  reqsPerSec: number;
  latencyAvg: number; // microseconds
  latencyP99: number; // microseconds
}

// ── Frameworks ───────────────────────────────────────────────────────────────

const frameworks: Framework[] = [
  {
    name: "Nestelia",
    runtime: "Bun",
    cmd: ["bun", "run", "benchmark/src/nestelia.ts"],
    cwd: ROOT,
  },
  {
    name: "Elysia",
    runtime: "Bun",
    cmd: ["bun", "run", "benchmark/src/elysia.ts"],
    cwd: ROOT,
  },
  {
    name: "Fastify",
    runtime: "Node",
    cmd: ["node", "--import", "tsx", resolve(BENCH_DIR, "src/fastify.js")],
    cwd: resolve(BENCH_DIR),
  },
  {
    name: "Express",
    runtime: "Node",
    cmd: ["node", resolve(BENCH_DIR, "src/express.js")],
    cwd: resolve(BENCH_DIR),
  },
  {
    name: "NestJS",
    runtime: "Node",
    cmd: ["node", "--import", "tsx", resolve(BENCH_DIR, "src/nestjs.ts")],
    cwd: resolve(BENCH_DIR),
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectBenchTool(): "bombardier" | "oha" | null {
  try {
    execSync("which bombardier", { stdio: "ignore" });
    return "bombardier";
  } catch {
    try {
      execSync("which oha", { stdio: "ignore" });
      return "oha";
    } catch {
      return null;
    }
  }
}

async function waitForServer(port: number, timeout = 15000): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(`http://localhost:${port}/`);
      if (res.ok) return true;
    } catch {
      // not ready yet
    }
    await Bun.sleep(100);
  }
  return false;
}

function startServer(fw: Framework): ReturnType<typeof spawn> {
  const proc = spawn(fw.cmd[0], fw.cmd.slice(1), {
    cwd: fw.cwd,
    env: { ...process.env, PORT: String(PORT), ...fw.env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  return proc;
}

async function killServer(proc: ReturnType<typeof spawn>) {
  proc.kill("SIGTERM");
  await new Promise<void>((resolve) => {
    proc.on("close", () => resolve());
    setTimeout(() => {
      proc.kill("SIGKILL");
      resolve();
    }, 3000);
  });
  // Ensure port is fully released
  await waitForPortFree(PORT);
}

async function waitForPortFree(port: number, timeout = 5000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      await fetch(`http://localhost:${port}/`);
      // Still responding — wait
      await Bun.sleep(200);
    } catch {
      return; // Port is free
    }
  }
  // Force kill anything on this port
  try {
    execSync(`lsof -ti :${port} | xargs kill -9`, { stdio: "ignore" });
    await Bun.sleep(500);
  } catch {
    // nothing to kill
  }
}

function runBombardier(
  port: number,
  duration: string,
  connections: number,
): string {
  return execSync(
    `bombardier -c ${connections} -d ${duration} --print r --format json http://localhost:${port}/`,
    { encoding: "utf-8", timeout: 120000 },
  );
}

function runOha(
  port: number,
  duration: string,
  connections: number,
): string {
  return execSync(
    `oha -c ${connections} -z ${duration} --json http://localhost:${port}/`,
    { encoding: "utf-8", timeout: 120000 },
  );
}

function parseBombardierResult(json: string): {
  reqsPerSec: number;
  latencyAvg: number;
  latencyP99: number;
} {
  const data = JSON.parse(json);
  return {
    reqsPerSec: Math.round(data.result.rps.mean),
    latencyAvg: data.result.latency.mean, // microseconds
    latencyP99: data.result.latency.max,  // bombardier doesn't expose p99 latency in JSON
  };
}

function parseOhaResult(json: string): {
  reqsPerSec: number;
  latencyAvg: number;
  latencyP99: number;
} {
  const data = JSON.parse(json);
  return {
    reqsPerSec: Math.round(data.summary.requestsPerSec),
    latencyAvg: data.summary.average * 1_000_000, // seconds to microseconds
    latencyP99: (data.latencyPercentiles?.p99 ?? 0) * 1_000_000,
  };
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatLatency(us: number): string {
  if (us < 1000) return `${us.toFixed(0)} us`;
  return `${(us / 1000).toFixed(2)} ms`;
}

// ── Bar chart display ────────────────────────────────────────────────────────

const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const MAGENTA = "\x1b[35m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const GRAY = "\x1b[90m";

const COLORS: Record<string, string> = {
  Nestelia: MAGENTA,
  Elysia: CYAN,
  Fastify: YELLOW,
  Express: GREEN,
  NestJS: RED,
};

function printResults(results: BenchResult[]) {
  const sorted = [...results].sort((a, b) => b.reqsPerSec - a.reqsPerSec);
  const maxRps = sorted[0].reqsPerSec;
  const BAR_WIDTH = 45;

  console.log();
  console.log(
    `${BOLD}  ╔══════════════════════════════════════════════════════════════════════╗${RESET}`,
  );
  console.log(
    `${BOLD}  ║                       Benchmark Results                             ║${RESET}`,
  );
  console.log(
    `${BOLD}  ║            GET / → "Hello World" (plain text)                       ║${RESET}`,
  );
  console.log(
    `${BOLD}  ╚══════════════════════════════════════════════════════════════════════╝${RESET}`,
  );
  console.log();

  for (const r of sorted) {
    const color = COLORS[r.name] || GRAY;
    const barLen = Math.round((r.reqsPerSec / maxRps) * BAR_WIDTH);
    const bar = "█".repeat(barLen);
    const empty = " ".repeat(BAR_WIDTH - barLen);
    const name = r.name.padEnd(10);
    const runtime = r.runtime.padEnd(5);

    console.log(
      `  ${color}${BOLD}${name}${RESET} ${DIM}${runtime}${RESET} ${color}${bar}${RESET}${empty} ${BOLD}${formatNumber(r.reqsPerSec)}${RESET} reqs/s`,
    );
  }

  console.log();
  console.log(`  ${DIM}${"─".repeat(68)}${RESET}`);
  console.log();

  // Comparisons: always use Nestelia as the base
  const nestelia = sorted.find((r) => r.name === "Nestelia") ?? sorted[0];
  const color = COLORS[nestelia.name] || MAGENTA;

  // Show Elysia comparison if present (as "near-zero overhead")
  const elysia = sorted.find((r) => r.name === "Elysia");
  if (elysia && nestelia.name === "Nestelia") {
    const overhead = (((elysia.reqsPerSec - nestelia.reqsPerSec) / elysia.reqsPerSec) * 100).toFixed(1);
    console.log(
      `  ${color}${BOLD}~${overhead}%${RESET} overhead vs plain Elysia ${DIM}(DI + decorators)${RESET}`,
    );
  }

  for (const r of sorted) {
    if (r.name === "Nestelia" || r.name === "Elysia") continue;
    const multiplier = (nestelia.reqsPerSec / r.reqsPerSec).toFixed(1);
    console.log(
      `  ${color}${BOLD}${multiplier}x${RESET} faster than ${r.name} ${DIM}(${r.runtime})${RESET}`,
    );
  }

  console.log();

  // Detailed table
  console.log(
    `  ${BOLD}${"Framework".padEnd(12)} ${"Runtime".padEnd(8)} ${"Reqs/s".padStart(12)} ${"Avg Latency".padStart(14)} ${"P99 Latency".padStart(14)}${RESET}`,
  );
  console.log(`  ${DIM}${"─".repeat(62)}${RESET}`);

  for (const r of sorted) {
    const color = COLORS[r.name] || "";
    console.log(
      `  ${color}${r.name.padEnd(12)}${RESET} ${DIM}${r.runtime.padEnd(8)}${RESET} ${formatNumber(r.reqsPerSec).padStart(12)} ${formatLatency(r.latencyAvg).padStart(14)} ${formatLatency(r.latencyP99).padStart(14)}`,
    );
  }

  console.log();
  console.log(
    `  ${DIM}Measured with ${CONNECTIONS} connections over ${DURATION}. Higher is better.${RESET}`,
  );
  console.log();
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const tool = detectBenchTool();

  if (!tool) {
    console.error(`
  No HTTP benchmark tool found. Install one of:

    brew install bombardier    ${DIM}(recommended)${RESET}
    brew install oha

  Then re-run: bun benchmark/run.ts
`);
    process.exit(1);
  }

  console.log();
  console.log(
    `  ${BOLD}Nestelia Benchmark${RESET} ${DIM}(using ${tool}, ${CONNECTIONS} connections, ${DURATION})${RESET}`,
  );
  console.log();

  // Check benchmark deps
  if (!existsSync(resolve(BENCH_DIR, "node_modules"))) {
    console.log(`  ${DIM}Installing benchmark dependencies...${RESET}`);
    execSync("bun install", { cwd: BENCH_DIR, stdio: "inherit" });
    console.log();
  }

  const results: BenchResult[] = [];

  // Filter frameworks if specified via CLI args
  const only = process.argv
    .slice(2)
    .filter((a) => !a.startsWith("-"))
    .map((s) => s.toLowerCase());

  const toRun =
    only.length > 0
      ? frameworks.filter((fw) => only.includes(fw.name.toLowerCase()))
      : frameworks;

  for (const fw of toRun) {
    const color = COLORS[fw.name] || "";
    process.stdout.write(
      `  ${color}${BOLD}${fw.name}${RESET} ${DIM}(${fw.runtime})${RESET} ... `,
    );

    const proc = startServer(fw);
    const ready = await waitForServer(PORT);

    if (!ready) {
      console.log(`${RED}FAILED (server did not start)${RESET}`);
      await killServer(proc);
      continue;
    }

    // Warmup
    try {
      if (tool === "bombardier") {
        runBombardier(PORT, WARMUP_DURATION, WARMUP_CONNECTIONS);
      } else {
        runOha(PORT, WARMUP_DURATION, WARMUP_CONNECTIONS);
      }
    } catch {
      // warmup failure is non-fatal
    }

    // Benchmark
    try {
      let raw: string;
      let parsed: { reqsPerSec: number; latencyAvg: number; latencyP99: number };

      if (tool === "bombardier") {
        raw = runBombardier(PORT, DURATION, CONNECTIONS);
        parsed = parseBombardierResult(raw);
      } else {
        raw = runOha(PORT, DURATION, CONNECTIONS);
        parsed = parseOhaResult(raw);
      }

      results.push({
        name: fw.name,
        runtime: fw.runtime,
        ...parsed,
      });

      console.log(
        `${BOLD}${formatNumber(parsed.reqsPerSec)}${RESET} reqs/s`,
      );
    } catch (e) {
      console.log(`${RED}FAILED${RESET}`);
      console.error(`  ${DIM}${e}${RESET}`);
    }

    await killServer(proc);
    // Small gap between benchmarks
    await Bun.sleep(1000);
  }

  if (results.length > 0) {
    printResults(results);

    // Save results to JSON
    const outPath = resolve(BENCH_DIR, "results.json");
    await Bun.write(
      outPath,
      JSON.stringify(
        {
          date: new Date().toISOString(),
          tool,
          connections: CONNECTIONS,
          duration: DURATION,
          system: {
            platform: process.platform,
            arch: process.arch,
            bun: Bun.version,
            node: execSync("node --version", { encoding: "utf-8" }).trim(),
          },
          results: results
            .sort((a, b) => b.reqsPerSec - a.reqsPerSec)
            .map((r) => ({
              name: r.name,
              runtime: r.runtime,
              reqsPerSec: r.reqsPerSec,
              latencyAvgUs: Math.round(r.latencyAvg),
              latencyP99Us: Math.round(r.latencyP99),
            })),
        },
        null,
        2,
      ),
    );
    console.log(`  ${DIM}Results saved to benchmark/results.json${RESET}`);
    console.log();
  }
}

main().catch(console.error);
