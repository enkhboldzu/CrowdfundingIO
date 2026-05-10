#!/usr/bin/env bash
# ============================================================
#  CrowdfundMN — Deploy script
#  Called by GitHub Actions on the self-hosted runner.
#  Also safe to run manually: bash scripts/deploy.sh
# ============================================================
set -euo pipefail

APP_DIR="/opt/crowdfund-api"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# ── 1. Sync code to app directory ────────────────────────────
info "Syncing code → $APP_DIR"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.env' \
  "$REPO_DIR/" "$APP_DIR/"

# ── 2. Copy .env if not present (first deploy) ───────────────
if [[ ! -f "$APP_DIR/.env" ]]; then
  warn ".env missing in $APP_DIR — copy it manually then redeploy"
  exit 1
fi

cd "$APP_DIR"

# ── 3. Install / update dependencies ─────────────────────────
info "npm install"
npm install --omit=dev

# ── 4. Generate Prisma client ─────────────────────────────────
info "prisma generate"
npx prisma generate

# ── 5. Run migrations ─────────────────────────────────────────
info "prisma migrate deploy"
npx prisma migrate deploy

# ── 6. Restart via pm2 ───────────────────────────────────────
info "pm2 reload"
pm2 reload "$APP_DIR/ecosystem.config.js" --env production \
  || pm2 start "$APP_DIR/ecosystem.config.js" --env production

pm2 save
info "Deploy complete → $(curl -sf http://127.0.0.1:4000/health || echo 'health check pending')"
