#!/usr/bin/env bash
# ==============================================================================
# Zero-Downtime Production Deployment Script for Lovelog (lovelog.my.id)
# Location on VPS: /var/www/personal-memory-journal/ops/scripts/deploy.sh
# ==============================================================================
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/personal-memory-journal}"
BRANCH="${BRANCH:-main}"

echo "=================================================================="
echo "  Starting Lovelog Production Deployment ($(date -u +"%Y-%m-%dT%H:%M:%SZ"))"
echo "=================================================================="

cd "$APP_DIR"

# 1. Fetch & reset cleanly to latest commit on origin/main
#    (preserves untracked files such as .env, .env.local, and public/uploads/*)
echo "[1/5] Fetching latest code from origin/${BRANCH}..."
git fetch origin "$BRANCH"
git reset --hard "origin/${BRANCH}"

# 2. Install dependencies cleanly if package-lock.json changed
echo "[2/5] Installing dependencies..."
npm ci --prefer-offline --no-audit --no-fund || npm install --no-audit --no-fund

# 3. Generate Prisma Client & apply idempotent DB indexes if database is available
echo "[3/5] Generating Prisma client & verifying database indexes..."
npx prisma generate

if [ -f ".env.local" ]; then
  set -a && source .env.local && set +a
elif [ -f ".env" ]; then
  set -a && source .env && set +a
fi

if [ -n "${DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1; then
  CLEAN_DB_URL="${DATABASE_URL%%\?*}"
  psql "$CLEAN_DB_URL" -f ops/database/db-optimization.sql >/dev/null 2>&1 || true
fi

# 4. Build Next.js production bundle
echo "[4/5] Building Next.js production application..."
npm run build

# 5. Reload PM2 processes & verify health check
echo "[5/5] Reloading PM2 processes..."
sed -i 's/"lovelog-api"/"memory-api"/' ops/pm2/ecosystem.config.cjs 2>/dev/null || true
pm2 startOrReload ops/pm2/ecosystem.config.cjs --update-env
pm2 save

# Reset local template change so working tree stays clean
git checkout -- ops/pm2/ecosystem.config.cjs 2>/dev/null || true

echo "Waiting 3 seconds for services to settle..."
sleep 3

curl -fsS http://127.0.0.1:3001/health && echo ""
echo "=================================================================="
echo "  Deployment Completed Successfully!"
echo "=================================================================="
