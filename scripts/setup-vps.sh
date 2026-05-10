#!/usr/bin/env bash
# ============================================================
#  CrowdfundMN — VPS One-Shot Setup
#  Ubuntu 22.04 / 24.04
#  Run as root or a sudo user:
#    chmod +x setup-vps.sh && sudo bash setup-vps.sh
# ============================================================
set -euo pipefail

# ── Config (edit these before running) ──────────────────────
DOMAIN="crowdfunding.bowsys.mn"          # ← your API subdomain
ADMIN_EMAIL="info@bowsys.mn"   # ← for Let's Encrypt cert
DB_NAME="crowdfund_mn"
DB_USER="crowdfund"
DB_PASS="$(openssl rand -base64 24)" # random password (saved to .env)
APP_DIR="/opt/crowdfund-api"         # where the app lives on the VPS
APP_USER="crowdfund"                 # system user that runs the app
NODE_VERSION="24"
# ────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()    { echo -e "${GREEN}[✓]${NC} $*"; }
warn()    { echo -e "${YELLOW}[!]${NC} $*"; }
section() { echo -e "\n${GREEN}══ $* ══${NC}"; }

# ── Must run as root ─────────────────────────────────────────
if [[ $EUID -ne 0 ]]; then
  echo -e "${RED}Run as root: sudo bash setup-vps.sh${NC}"; exit 1
fi

# ── 1. System update ─────────────────────────────────────────
section "System update"
apt-get update -qq && apt-get upgrade -y -qq
apt-get install -y -qq curl wget git unzip ufw fail2ban
info "System updated"

# ── 2. Create app user ───────────────────────────────────────
section "App user"
if ! id "$APP_USER" &>/dev/null; then
  useradd --system --shell /bin/bash --create-home "$APP_USER"
  info "Created user: $APP_USER"
else
  info "User $APP_USER already exists"
fi

# ── 3. Node.js ───────────────────────────────────────────────
section "Node.js $NODE_VERSION"
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash - -qq
apt-get install -y -qq nodejs
info "Node $(node -v) installed"

npm install -g pm2 --silent
info "pm2 $(pm2 -v) installed"

# ── 4. PostgreSQL ────────────────────────────────────────────
section "PostgreSQL"
apt-get install -y -qq postgresql postgresql-contrib
systemctl enable postgresql --now

sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || \
  sudo -u postgres psql -c "ALTER USER $DB_USER WITH PASSWORD '$DB_PASS';"
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || \
  info "Database $DB_NAME already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;"

info "PostgreSQL ready — db: $DB_NAME, user: $DB_USER"

# ── 5. nginx ─────────────────────────────────────────────────
section "nginx"
apt-get install -y -qq nginx
systemctl enable nginx --now
info "nginx installed"

# ── 6. App directory ─────────────────────────────────────────
section "App directory"
mkdir -p "$APP_DIR"
chown "$APP_USER:$APP_USER" "$APP_DIR"
info "App dir: $APP_DIR"

# ── 7. .env file ─────────────────────────────────────────────
section ".env"
JWT_SECRET="$(openssl rand -base64 48)"
ENV_FILE="$APP_DIR/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<EOF
NODE_ENV=production
PORT=4000

DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}

JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

CORS_ORIGINS=https://${DOMAIN}

UPLOAD_DIR=/opt/crowdfund-api/uploads
MAX_FILE_SIZE_MB=10
EOF
  chown "$APP_USER:$APP_USER" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  info ".env written to $ENV_FILE"
else
  warn ".env already exists — skipped (keeping existing secrets)"
fi

# ── 8. nginx virtual host ────────────────────────────────────
section "nginx config"
NGINX_CONF="/etc/nginx/sites-available/crowdfund-api"
cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ { root /var/www/html; }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;
    ssl_session_cache   shared:SSL:10m;

    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;

    client_max_body_size 15M;

    location / {
        proxy_pass         http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host \$host;
        proxy_set_header   X-Real-IP \$remote_addr;
        proxy_set_header   X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 60s;
    }
}
EOF

ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/crowdfund-api
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
info "nginx config written"

# ── 9. SSL (Let's Encrypt) ───────────────────────────────────
section "SSL — Let's Encrypt"
apt-get install -y -qq certbot python3-certbot-nginx

# Get cert (HTTP-01 challenge)
certbot certonly --nginx \
  --non-interactive \
  --agree-tos \
  --email "$ADMIN_EMAIL" \
  -d "$DOMAIN" || warn "certbot failed — domain DNS may not be pointing here yet. Run manually: certbot --nginx -d $DOMAIN"

# Auto-renewal
systemctl enable certbot.timer --now 2>/dev/null || true
info "SSL done"

nginx -t && systemctl reload nginx

# ── 10. Firewall ─────────────────────────────────────────────
section "Firewall (ufw)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
info "Firewall configured (SSH, 80, 443 open)"

# ── 11. pm2 startup ──────────────────────────────────────────
section "pm2 startup"
env PATH="$PATH:/usr/bin" pm2 startup systemd -u "$APP_USER" --hp "/home/$APP_USER" | bash || true
info "pm2 configured for startup"

# ── 12. GitHub Actions runner ────────────────────────────────
section "GitHub Actions Self-Hosted Runner"
RUNNER_DIR="/home/$APP_USER/actions-runner"
RUNNER_VERSION="2.323.0"

if [[ ! -d "$RUNNER_DIR" ]]; then
  mkdir -p "$RUNNER_DIR"
  cd "$RUNNER_DIR"

  curl -sL "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
    | tar xz
  chown -R "$APP_USER:$APP_USER" "$RUNNER_DIR"
  info "Runner downloaded to $RUNNER_DIR"
else
  info "Runner directory already exists — skipping download"
fi

# ── Done ─────────────────────────────────────────────────────
section "Setup complete!"
echo ""
echo -e "${GREEN}Database password:${NC} $DB_PASS  (also in $ENV_FILE)"
echo -e "${GREEN}App directory:${NC}     $APP_DIR"
echo -e "${GREEN}Nginx config:${NC}      $NGINX_CONF"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Register the GitHub Actions runner (run as $APP_USER):"
echo ""
echo -e "     ${YELLOW}sudo -u $APP_USER bash${NC}"
echo -e "     ${YELLOW}cd $RUNNER_DIR${NC}"
echo -e "     ${YELLOW}./config.sh --url https://github.com/YOUR_ORG/CrowdfundingIO --token YOUR_RUNNER_TOKEN${NC}"
echo -e "     ${YELLOW}sudo ./svc.sh install $APP_USER && sudo ./svc.sh start${NC}"
echo ""
echo "     Get your token: GitHub repo → Settings → Actions → Runners → New self-hosted runner"
echo ""
echo "  2. Push code to GitHub — CI will auto-deploy."
echo "  3. Check: curl https://${DOMAIN}/health"
echo ""
