# Экспорт базы данных

Скрипты для выгрузки `lab_equipment_booking` в трёх форматах — **SQL**, **JSON**, **XML** (требование учебного задания / отчёта).

## Зачем это нужно

| Формат | Назначение |
|--------|------------|
| **SQL** | Полный дамп для восстановления БД на другом сервере; включает схему, данные, процедуры, триггеры |
| **JSON** | Удобен для API, тестов, миграций и просмотра данных в редакторе |
| **XML** | Структурированный обмен данными; часто требуется в отчётах по БД |

В отчёт обычно вкладывают:
- один **актуальный** файл из `output/` (после запуска скриптов);
- или **примеры** из `examples/` — если дамп слишком большой.

## Быстрый старт

Перед экспортом БД должна быть развёрнута (`schema.sql`, `seed.sql`, …). В `server/.env` — рабочие `DB_*` (для JSON/XML).

### Всё сразу (Windows)

```powershell
.\database\export\export-all.ps1
```

### По отдельности

**SQL** (нужен `mysqldump`, например из XAMPP):

```powershell
.\database\export\export-sql.ps1 -User root -Password ""
```

**JSON / XML** (из корня проекта, нужен `npm install` в `server/`):

```powershell
node database/export/export-json.mjs
node database/export/export-xml.mjs
```

Результаты: `database/export/output/`  
Имена файлов: `lab_equipment_booking_YYYY-MM-DD_HH-mm-ss.{sql,json,xml}`

## Примеры для отчёта

Статические образцы (укороченные данные):

- `examples/lab_equipment_booking-sample.sql`
- `examples/lab_equipment_booking-sample.json`
- `examples/lab_equipment_booking-sample.xml`

Подробное описание для раздела отчёта: [docs/12-database-export.md](../../docs/12-database-export.md)

## Безопасность

- В JSON/XML поле `users.password_hash` заменяется на `[REDACTED]`.
- Папка `output/` в `.gitignore` — не коммитьте дампы с реальными паролями.
- SQL-дамп из `mysqldump` содержит хэши паролей из `seed.sql` — для публичного репозитория используйте только `examples/` или пересоздайте seed без секретов.


# Ошибка PowerShell PSSecurityException / UnauthorizedAccess
На Windows по умолчанию часто стоит политика Restricted: интерактивные команды в PowerShell работают, а файлы .ps1 запускать нельзя.
npm вызывает export-sql.ps1 как скрипт — система его блокирует.

Как получить SQL-дамп сейчас (без смены политики)
Вариант 1 — обход для одного запуска:

cd c:\PROJECTS\lab-equipment-booking-saas\server
powershell -ExecutionPolicy Bypass -File ..\database\export\export-sql.ps1

Вариант 2 — mysqldump напрямую (если XAMPP):
C:\xampp\mysql\bin\mysqldump.exe -u root --databases lab_equipment_booking --routines --triggers -r ..\database\export\output\dump.sql