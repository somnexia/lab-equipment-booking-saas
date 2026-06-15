# Lab Equipment Booking database

Canonical scripts (use these instead of `lab_equipment_booking*.sql` dumps in the project root):

| File | Purpose |
|------|---------|
| `schema.sql` | Create database and tables |
| `seed.sql` | Test organizations, users, equipment, bookings |
| `migrate_from_legacy_roles.sql` | Upgrade an existing DB from legacy roles |
| `procedures.sql` | Functions and stored procedures (bookings, equipment status) |
| `views.sql` | Views for catalog, bookings, users |
| `grants.sql` | MySQL users and GRANT permissions |
| `export/` | DB export to SQL, JSON, XML — see [export/README.md](export/README.md) |

## Fresh install

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p lab_equipment_booking < database/procedures.sql
mysql -u root -p lab_equipment_booking < database/views.sql
mysql -u root -p < database/grants.sql
```

- Procedures: [docs/09-stored-procedures.md](../docs/09-stored-procedures.md)  
- Views: [docs/10-views.md](../docs/10-views.md)  
- Grants: [docs/11-grants.md](../docs/11-grants.md)

## Demo users (5 accounts)

Password for all: `Password123!`

| Email | Role |
|-------|------|
| admin@lab.local | system_admin |
| lab.admin@chem.lab.local | lab_admin |
| manager@chem.lab.local | equipment_manager |
| researcher@chem.lab.local | researcher |
| student@chem.lab.local | student |

The **technician** role exists in the schema; a separate demo login is optional. To test maintenance workflows:

```sql
UPDATE users SET role = 'technician' WHERE email = 'manager@chem.lab.local';
-- after testing, restore: equipment_manager
```

## Application user (`labuser`)

Created in `grants.sql`. The password in `.env` (`DB_PASSWORD`) must match the password in SQL  
(default in the script: `ChangeMe_LabUser` — **replace** with your own).

Verify grants:

```sql
SHOW GRANTS FOR 'labuser'@'localhost';
SHOW GRANTS FOR 'app_student'@'localhost';
```

## Test via PowerShell (not the browser)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"email":"student@chem.lab.local","password":"Password123!"}'
```
