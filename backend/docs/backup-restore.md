# Database backup and restore drills

Applies to PostgreSQL (including Supabase-managed Postgres).

## Logical backups with `pg_dump`

Requires [PostgreSQL client tools](https://www.postgresql.org/download/) (`pg_dump`, `pg_restore`) and a valid `DATABASE_URL` (e.g. from `.env`).

### Create a compressed custom-format dump

```bash
cd backend
set -a && source .env && set +a   # or: source ./scripts/load-env.sh
./scripts/db-backup.sh ./backups/prochef.dump
```

The script uses **custom format** (`-Fc`) for flexible restore and parallel restore support.

### Restore (overwrite target — use a disposable DB first)

**Never** run `--clean` against production until you have validated the dump on a staging instance.

```bash
./scripts/db-restore.sh ./backups/prochef.dump "$DATABASE_URL"
```

For a **new empty database**, create the empty DB first, then `pg_restore` without `--clean`, or use Supabase “restore from backup” in the dashboard.

## Supabase

- **Dashboard:** Project → Database → Backups / Point-in-time recovery (plan-dependent).
- **Drills:** Periodically restore a backup into a **separate project** or local Postgres, run `npx prisma migrate status`, and spot-check critical tables row counts vs production (sanitized).

## Drill checklist (suggested quarterly)

1. Note current migration revision in production (`prisma migrate status` or schema version table).
2. Take a fresh `pg_dump` with `db-backup.sh`; record file size and checksum.
3. Restore into **staging** (or local) with `db-restore.sh` or platform UI.
4. Point staging `DATABASE_URL` at the restored DB; run API smoke tests (`/health/ready`, login, one read path).
5. Document time-to-restore and any gaps (extensions, roles, RLS policies).
6. Rotate any credentials that were copied into non-production environments.

## Object storage (S3)

Scan images and uploads are not in Postgres. Mirror **S3 lifecycle / versioning** policies and document how to reattach metadata in the app if you restore DB-only to a point before an upload.
