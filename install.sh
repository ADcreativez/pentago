#!/bin/bash

# Pentago Automated Installer Script for Debian/Ubuntu
# Make sure to run this script as root or with sudo: sudo bash install.sh

# Exit immediately if a command exits with a non-zero status
set -e

# Define Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}[*] Starting Pentago installation...${NC}"

# 1. Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[!] Please run as root or using sudo.${NC}"
  exit 1
fi

# Get current script directory
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
echo -e "${GREEN}[*] App Directory detected: $APP_DIR${NC}"

# 2. Install System Dependencies
echo -e "${GREEN}[*] Installing system dependencies (Python3, pip, venv, Nginx, UFW)...${NC}"
apt-get update
apt-get install -y python3 python3-pip python3-venv nginx ufw git

# 3. Setup Virtual Environment and Python packages
echo -e "${GREEN}[*] Setting up Python virtual environment...${NC}"
if [ -d "$APP_DIR/venv" ]; then
    echo "[*] Removing existing virtual environment..."
    rm -rf "$APP_DIR/venv"
fi

python3 -m venv "$APP_DIR/venv"
source "$APP_DIR/venv/bin/activate"

echo -e "${GREEN}[*] Installing python packages...${NC}"
pip install --upgrade pip
pip install Flask Flask-SQLAlchemy cryptography pyotp gunicorn

deactivate

# 4. Correct file permissions for www-data (the web server user)
echo -e "${GREEN}[*] Setting directory permissions for www-data...${NC}"
# Allow SQLite database writes and media uploads by setting ownership to www-data
chown -R www-data:www-data "$APP_DIR"
chmod -R 775 "$APP_DIR"

# 5. Create Systemd Service File
echo -e "${GREEN}[*] Configuring Systemd Service for Pentago...${NC}"
SERVICE_FILE="/etc/systemd/system/pentago.service"

cat <<EOF > "$SERVICE_FILE"
[Unit]
Description=Gunicorn instance to serve Pentago app
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=$APP_DIR
Environment="PATH=$APP_DIR/venv/bin"
ExecStart=$APP_DIR/venv/bin/gunicorn --workers 3 --bind 0.0.0.0:5001 app:app

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
echo -e "${GREEN}[*] Starting Pentago service...${NC}"
systemctl daemon-reload
systemctl start pentago
systemctl enable pentago

# 6. Configure Nginx Reverse Proxy
echo -e "${GREEN}[*] Configuring Nginx reverse proxy...${NC}"
NGINX_CONF="/etc/nginx/sites-available/pentago"

cat <<EOF > "$NGINX_CONF"
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        client_max_body_size 50M;
    }
}
EOF

# Enable configuration and disable default Nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    rm -f "/etc/nginx/sites-enabled/default"
fi

if [ ! -f "/etc/nginx/sites-enabled/pentago" ]; then
    ln -s "$NGINX_CONF" "/etc/nginx/sites-enabled/"
fi

# Test Nginx and restart
nginx -t
systemctl restart nginx

# 7. Configure Firewall (UFW)
echo -e "${GREEN}[*] Setting up firewall rules...${NC}"
# Allow standard HTTP (80) and HTTPS (443) traffic through Nginx
ufw allow 'Nginx Full'
# Also allow SSH so you don't lock yourself out of the server
ufw allow OpenSSH || ufw allow 22/tcp

# Enable firewall (non-interactively)
echo "y" | ufw enable

echo -e "${GREEN}[+] Installation completed successfully!${NC}"
echo -e "${GREEN}[+] App is now running and proxying via Nginx on port 80.${NC}"
echo -e "${GREEN}[+] You can monitor service logs using: journalctl -u pentago -f${NC}"
