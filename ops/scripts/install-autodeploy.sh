#!/usr/bin/env bash
# ==============================================================================
# GitOps Pull-Based Auto-Deploy Installer for IPv6 VPS (0 MB Idle RAM)
# Checks origin/main every minute with flock concurrency protection.
# When a new commit is pushed to GitHub main, automatically runs deploy.sh.
# ==============================================================================
set -euo pipefail

cat << 'EOF' > /usr/local/bin/lovelog-autodeploy.sh
#!/usr/bin/env bash
set -euo pipefail

export PATH="/root/.nvm/versions/node/$(ls /root/.nvm/versions/node 2>/dev/null | tail -n 1)/bin:/root/.local/share/fnm/aliases/default/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
APP_DIR="/var/www/personal-memory-journal"
LOCK_FILE="/tmp/lovelog-deploy.lock"
LOG_FILE="/var/log/lovelog-deploy.log"

# Prevent overlapping deployments if a build is already running
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  exit 0
fi

cd "$APP_DIR"
LOCAL_SHA=$(git rev-parse HEAD)
REMOTE_SHA=$(git ls-remote origin refs/heads/main | awk '{print $1}')

if [ -n "$REMOTE_SHA" ] && [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
  echo "==================================================================" >> "$LOG_FILE"
  echo "[$(date -Is)] New commit detected: $LOCAL_SHA -> $REMOTE_SHA" >> "$LOG_FILE"
  git fetch origin main >> "$LOG_FILE" 2>&1
  sed -i 's/\r$//' ops/scripts/deploy.sh 2>/dev/null || true
  bash ./ops/scripts/deploy.sh >> "$LOG_FILE" 2>&1
  echo "[$(date -Is)] Successfully deployed $REMOTE_SHA" >> "$LOG_FILE"
fi
EOF

chmod +x /usr/local/bin/lovelog-autodeploy.sh

# Register cron job every 1 minute (idempotent)
(crontab -l 2>/dev/null | grep -v "lovelog-autodeploy.sh" || true; echo "* * * * * /usr/local/bin/lovelog-autodeploy.sh") | crontab -

echo "Auto-deploy cron installed! Running initial sync check now..."
/usr/local/bin/lovelog-autodeploy.sh
echo "Done. Deployment logs can be viewed anytime with: tail -f /var/log/lovelog-deploy.log"
