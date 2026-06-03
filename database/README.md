# База данных Lab Equipment Booking

Канонические скрипты (используйте их вместо дампов `lab_equipment_booking*.sql` в корне):

| Файл | Назначение |
|------|------------|
| `schema.sql` | Создание БД и таблиц |
| `seed.sql` | Тестовые организации, пользователи, оборудование, брони |
| `migrate_from_legacy_roles.sql` | Обновление существующей БД со старых ролей |

## Установка с нуля

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

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
