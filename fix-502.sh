#!/bin/bash
# Fix 502 error by updating Caddyfile to use 0.0.0.0 instead of localhost

# Backup original file
cp /app/Caddyfile /app/Caddyfile.backup.$(date +%s)

# Replace localhost:3000 with 0.0.0.0:3000
sed -i 's/reverse_proxy localhost:3000/reverse_proxy 0.0.0.0:3000/g' /app/Caddyfile

# Replace localhost:{query.XTransformPort} with 0.0.0.0:{query.XTransformPort}
sed -i 's/reverse_proxy localhost:{query.XTransformPort}/reverse_proxy 0.0.0.0:{query.XTransformPort}/g' /app/Caddyfile

# Reload Caddy to apply changes
pkill -HUP caddy 2>/dev/null || true

echo "Caddyfile updated to fix 502 error"
echo "Changes:"
echo "  - Changed localhost:3000 to 0.0.0.0:3000"
echo "  - Caddy will be reloaded automatically"
