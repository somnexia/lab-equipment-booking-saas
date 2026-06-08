# База данных Lab Equipment Booking

Канонические скрипты (используйте их вместо дампов `lab_equipment_booking*.sql` в корне):

| Файл | Назначение |
|------|------------|
| `schema.sql` | Создание БД и таблиц |
| `seed.sql` | Тестовые организации, пользователи, оборудование, брони |
| `migrate_from_legacy_roles.sql` | Обновление существующей БД со старых ролей |
| `procedures.sql` | Функции и хранимые процедуры (брони, статус оборудования) |
| `views.sql` | Представления для каталога, броней, пользователей |
| `grants.sql` | Пользователи MySQL и назначение прав (GRANT) |

## Установка с нуля

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
mysql -u root -p lab_equipment_booking < database/procedures.sql
mysql -u root -p lab_equipment_booking < database/views.sql
mysql -u root -p < database/grants.sql
```

- Процедуры: [docs/09-stored-procedures.md](../docs/09-stored-procedures.md)  
- Представления: [docs/10-views.md](../docs/10-views.md)  
- Права: [docs/11-grants.md](../docs/11-grants.md)

## Демо-пользователи (5 аккаунтов)

Пароль для всех: `Password123!`

| Email | Роль |
|-------|------|
| admin@lab.local | system_admin |
| lab.admin@chem.lab.local | lab_admin |
| manager@chem.lab.local | equipment_manager |
| researcher@chem.lab.local | researcher |
| student@chem.lab.local | student |

Роль **technician** в схеме есть, отдельный демо-логин не обязателен. Для проверки ТО:

```sql
UPDATE users SET role = 'technician' WHERE email = 'manager@chem.lab.local';
-- после теста верните: equipment_manager
```

## Пользователь приложения (`labuser`)

Создаётся в `grants.sql`. Пароль в `.env` (`DB_PASSWORD`) должен совпадать с паролем в SQL  
(по умолчанию в скрипте: `ChangeMe_LabUser` — **замените** на свой).

Проверка прав:

```sql
SHOW GRANTS FOR 'labuser'@'localhost';
SHOW GRANTS FOR 'app_student'@'localhost';
```

## Проверка через PowerShell (не через браузер)
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -ContentType "application/json" -Body
