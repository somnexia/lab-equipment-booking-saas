# Database export

Scripts to export `lab_equipment_booking` in three formats — **SQL**, **JSON**, **XML** (course assignment / report requirement).

## Why this exists

| Format | Purpose |
|--------|---------|
| **SQL** | Full dump for restoring the DB on another server; includes schema, data, procedures, triggers |
| **JSON** | Handy for APIs, tests, migrations, and viewing data in an editor |
| **XML** | Structured data exchange; often required in DB reports |

Reports usually include:
- one **current** file from `output/` (after running the scripts);
- or **samples** from `examples/` — if the dump is too large.

## Quick start

Before export, the DB must be deployed (`schema.sql`, `seed.sql`, …). In `server/.env` — working `DB_*` (for JSON/XML).

### Everything at once (Windows)

```powershell
.\database\export\export-all.ps1
```

### Individually

**SQL** (requires `mysqldump`, e.g. from XAMPP):

```powershell
.\database\export\export-sql.ps1 -User root -Password ""
```

**JSON / XML** (from project root, requires `npm install` in `server/`):

```powershell
node database/export/export-json.mjs
node database/export/export-xml.mjs
```

Output: `database/export/output/`  
Filenames: `lab_equipment_booking_YYYY-MM-DD_HH-mm-ss.{sql,json,xml}`

## Report samples

Static samples (shortened data):

- `examples/lab_equipment_booking-sample.sql`
- `examples/lab_equipment_booking-sample.json`
- `examples/lab_equipment_booking-sample.xml`

Detailed report section: [docs/12-database-export.md](../../docs/12-database-export.md)

## Security

- In JSON/XML, `users.password_hash` is replaced with `[REDACTED]`.
- The `output/` folder is in `.gitignore` — do not commit dumps with real passwords.
- SQL dumps from `mysqldump` contain password hashes from `seed.sql` — for public repos use only `examples/` or recreate seed without secrets.

## PowerShell PSSecurityException / UnauthorizedAccess

On Windows, the default policy is often Restricted: interactive PowerShell works, but `.ps1` files cannot run.
`npm` invokes `export-sql.ps1` as a script — the system blocks it.

### Get an SQL dump now (without changing policy)

**Option 1 — bypass for one run:**

```powershell
cd c:\PROJECTS\lab-equipment-booking-saas\server
powershell -ExecutionPolicy Bypass -File ..\database\export\export-sql.ps1
```

**Option 2 — mysqldump directly (if using XAMPP):**

```powershell
C:\xampp\mysql\bin\mysqldump.exe -u root --databases lab_equipment_booking --routines --triggers -r ..\database\export\output\dump.sql
```

**Option 3 — allow scripts for your user only (once):**

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then run again: `npm run export:db`.
