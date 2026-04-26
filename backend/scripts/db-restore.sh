#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
DUMP="${1:?Usage: $0 <dump-file> [database-url]}"
TARGET="${2:-${DATABASE_URL:-}}"
if [[ -z "$TARGET" ]]; then
  echo "Provide database URL as second arg or set DATABASE_URL" >&2
  exit 1
fi
if [[ ! -f "$DUMP" ]]; then
  echo "Dump file not found: $DUMP" >&2
  exit 1
fi
echo "Restoring $DUMP to target URL (ensure this is NOT production unless intended)…"
read -r -p "Type RESTORE to continue: " confirm
if [[ "$confirm" != "RESTORE" ]]; then
  echo "Aborted." >&2
  exit 1
fi
pg_restore --clean --if-exists -d "$TARGET" -j 4 "$DUMP"
echo "Restore finished."
