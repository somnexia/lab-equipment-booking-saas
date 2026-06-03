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

## Демо-пользователи

Пароль для всех: `Password123!`

| Email | Роль |
|-------|------|
| system.admin@lab.local | system_admin |
| lab.admin@chem.lab.local | lab_admin |
| equipment.manager@chem.lab.local | equipment_manager |
| researcher@chem.lab.local | researcher |
| student@chem.lab.local | student |
| technician@physics.lab.local | technician |
| guest@example.com | guest |
