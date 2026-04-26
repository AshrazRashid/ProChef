#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is not set. Export it or run: set -a && source .env && set +a" >&2
  exit 1
fi
OUT="${1:-./backups/prochef-$(date +%Y%m%d-%H%M%S).dump}"
mkdir -p "$(dirname "$OUT")"
pg_dump "$DATABASE_URL" -Fc -f "$OUT"
echo "Backup written to $OUT"
