#!/usr/bin/env bash
# Usage from backend/:  source ./scripts/load-env.sh
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [[ ! -f "$ROOT/.env" ]]; then
  echo "No .env at $ROOT/.env" >&2
  return 1 2>/dev/null || exit 1
fi
set -a
# shellcheck source=/dev/null
source "$ROOT/.env"
set +a
