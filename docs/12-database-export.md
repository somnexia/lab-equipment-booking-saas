# 12. Экспорт базы данных (SQL / XML / JSON)

## Зачем нужен экспорт

В учебном проекте экспорт БД показывает, что:

1. **Схема и данные задокументированы** — их можно передать преподавателю или восстановить на другой машине.
2. **Проект воспроизводим** — по SQL-дампу любой может поднять ту же БД без ручного ввода.
3. **Данные пригодны для обмена** — JSON/XML удобны для отчёта, интеграций и автоматических проверок.

Для **Lab Equipment Booking** экспортируются пять таблиц: `organizations`, `users`, `equipment_categories`, `equipment`, `bookings`.  
SQL-дамп дополнительно включает процедуры, VIEW и права (если они уже применены в БД).

## Где лежат файлы

| Путь | Содержание |
|------|------------|
| `database/export/export-sql.ps1` | Дамп через `mysqldump` |
| `database/export/export-json.mjs` | Выгрузка таблиц в JSON |
| `database/export/export-xml.mjs` | Выгрузка таблиц в XML |
| `database/export/export-all.ps1` | Все три формата подряд |
| `database/export/output/` | Сгенерированные файлы (не в git) |
| `database/export/examples/` | Укороченные образцы для отчёта |

Инструкция по запуску: [database/export/README.md](../database/export/README.md)

## Как это выглядит в отчёте

### 1. SQL

Фрагмент полного дампа:

```sql
CREATE DATABASE IF NOT EXISTS `lab_equipment_booking`;
USE `lab_equipment_booking`;

CREATE TABLE `organizations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  ...
);

INSERT INTO `organizations` VALUES (1,'Chemistry Lab','chem-lab',...);
-- + users, equipment, bookings, процедуры, VIEW
```

**В отчёте:** раздел «Приложение: дамп БД» — ссылка на файл или первые 1–2 страницы + полный файл в архиве.

### 2. JSON

Корневая структура:

```json
{
  "exported_at": "2026-06-03T12:00:00.000Z",
  "database": "lab_equipment_booking",
  "format": "json",
  "tables": {
    "organizations": [ { "id": 1, "name": "Chemistry Lab", ... } ],
    "users": [ { "email": "student@chem.lab.local", "password_hash": "[REDACTED]", ... } ],
    "equipment": [ ... ],
    "bookings": [ ... ]
  }
}
```

**В отчёте:** скриншот JSON в VS Code или таблица «количество записей по таблицам».

### 3. XML

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseExport name="lab_equipment_booking" format="xml" exportedAt="...">
  <table name="organizations">
    <row>
      <id>1</id>
      <name>Chemistry Lab</name>
      ...
    </row>
  </table>
  <table name="bookings">...</table>
</databaseExport>
```

**В отчёте:** фрагмент XML + пояснение, что каждая `<table>` соответствует таблице MySQL.

## Рекомендуемый текст для отчёта (шаблон)

> Экспорт базы данных выполнен в трёх форматах. SQL-дамп (`mysqldump`) содержит DDL, DML, хранимые процедуры и представления и позволяет полностью восстановить БД. JSON и XML получены скриптами Node.js (`export-json.mjs`, `export-xml.mjs`) из актуальных таблиц после загрузки демо-данных (`seed.sql`). Хэши паролей в JSON/XML маскируются. Файлы датированы и хранятся в `database/export/output/`. Образцы структуры — в `database/export/examples/`.

## Проверка после экспорта

1. SQL: `mysql -u root -p < output/lab_equipment_booking_....sql` на чистой БД (осторожно: перезапишет).
2. JSON: открыть в редакторе, убедиться что 5 ключей в `tables`.
3. XML: открыть в браузере — должен отображаться как дерево элементов.
