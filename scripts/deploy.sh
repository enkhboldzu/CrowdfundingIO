#!/usr/bin/env bash
# ============================================================
#  CrowdfundMN deploy script
#  Called by GitHub Actions on the self-hosted runner.
#  Also safe to run manually: bash scripts/deploy.sh
# ============================================================
set -euo pipefail

APP_DIR="/opt/crowdfund-api"
NEXT_DIR="$APP_DIR/crowdfund-mn"
REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info() { echo -e "${GREEN}[ok]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }

# 1. Sync code to app directory.
info "Syncing code to $APP_DIR"
rsync -a --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='.env' --exclude='.env.local' \
  "$REPO_DIR/" "$APP_DIR/"

# 2. Ensure server env exists.
if [[ ! -f "$APP_DIR/.env" ]]; then
  warn ".env missing in $APP_DIR - copy it manually then redeploy"
  exit 1
fi

# 3. Install / update Express API dependencies.
cd "$APP_DIR"
info "api npm install"
npm install --omit=dev

# 4. Generate Prisma client and run migrations for the API package.
info "api prisma generate"
npx prisma generate

info "api prisma migrate deploy"
npx prisma migrate deploy

# 5. Restart Express API via PM2.
info "pm2 reload api"
pm2 reload "$APP_DIR/ecosystem.config.js" --env production \
  || pm2 start "$APP_DIR/ecosystem.config.js" --env production

# 6. Build / restart Next.js frontend.
if [[ -d "$NEXT_DIR" ]]; then
  cd "$NEXT_DIR"

  if [[ ! -f ".env.local" && -f "$APP_DIR/.env" ]]; then
    info "linking frontend .env.local to ../.env"
    ln -s ../.env .env.local
  fi

  info "frontend npm install"
  npm install

  info "frontend build"
  npm run build

  mkdir -p "$NEXT_DIR/public/uploads"

  info "pm2 reload frontend"
  pm2 reload "$NEXT_DIR/ecosystem.config.js" --env production \
    || pm2 start "$NEXT_DIR/ecosystem.config.js" --env production
else
  warn "frontend directory missing: $NEXT_DIR"
fi

pm2 save
info "Deploy complete"
