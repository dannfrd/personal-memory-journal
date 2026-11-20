// ==============================================================================
// PM2 Ecosystem Config for 2 vCPU / 4 GB RAM VPS (VPS-01, VPS-07)
// Caps Node.js V8 heap to prevent OOM and auto-restarts if memory limit is exceeded
// ==============================================================================
module.exports = {
  apps: [
    {
      name: "lovelog-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000 -H ::",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "900M",
      node_args: "--max-old-space-size=768",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "lovelog-api",
      script: "server/vps-api.cjs",
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "450M",
      node_args: "--max-old-space-size=384",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
        DB_POOL_SIZE: "10",
        API_CACHE_TTL_MS: "30000",
      },
    },
  ],
};
