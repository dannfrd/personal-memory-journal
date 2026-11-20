#!/usr/bin/env node
// ==============================================================================
// API Response Time & Compression Benchmark (TEST-03, TEST-06, BE-07)
// Usage: node ops/testing/benchmark-api.mjs
// ==============================================================================
import { performance } from "node:perf_hooks";

const API_BASE = process.env.VPS_API_BASE_URL || "http://127.0.0.1:3001";
const SECRET = process.env.VPS_API_SECRET || "";
const ITERATIONS = Number(process.env.BENCH_ITERATIONS || 30);

function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function benchmarkEndpoint(name, path) {
  const latencies = [];
  let status5xx = 0;
  let lastEncoding = "none";
  let lastBytes = 0;

  for (let i = 0; i < ITERATIONS; i += 1) {
    const start = performance.now();
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Accept-Encoding": "br, gzip",
        ...(SECRET ? { "X-Internal-Secret": SECRET } : {}),
      },
    });
    const buf = await res.arrayBuffer();
    const duration = performance.now() - start;

    latencies.push(duration);
    if (res.status >= 500) status5xx += 1;
    lastEncoding = res.headers.get("content-encoding") || "identity";
    lastBytes = buf.byteLength;
  }

  latencies.sort((a, b) => a - b);
  const p50 = percentile(latencies, 50).toFixed(2);
  const p95 = percentile(latencies, 95).toFixed(2);
  const p99 = percentile(latencies, 99).toFixed(2);

  console.log(
    `[${name}] n=${ITERATIONS} | p50=${p50}ms | p95=${p95}ms | p99=${p99}ms | 5xx=${status5xx} | encoding=${lastEncoding} | size=${lastBytes}B`
  );
}

async function run() {
  console.log(`Benchmarking Lovelog API at ${API_BASE} ...`);
  try {
    await benchmarkEndpoint("GET /health", "/health");
    await benchmarkEndpoint("GET /memories?page=1&limit=12", "/memories?page=1&limit=12");
  } catch (err) {
    console.error("Benchmark failed (ensure server/vps-api.cjs is running):", err.message);
    process.exitCode = 1;
  }
}

run();
