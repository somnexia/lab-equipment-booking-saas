# Представления (VIEW)

Файл: [`database/views.sql`](../database/views.sql)

## Установка

```bash
mysql -u root -p lab_equipment_booking < database/views.sql
```

После `schema.sql`, `seed.sql`, `procedures.sql`.

---

## Для чего нужны VIEW

**VIEW (представление)** — сохранённый запрос `SELECT`, к которому обращаются **как к таблице**:

```sql
SELECT * FROM v_equipment_catalog;
```

| Без VIEW | С VIEW |
|----------|--------|
| В коде длинный JOIN на 3 таблицы | Один понятный источник данных |
| JOIN копируется в API, отчётах, phpMyAdmin | Логика чтения **один раз в БД** |
| В UI только `category_id` | Сразу `category_name`, `organization_name` |

**Процедуры** меняют данные (бронь, статус). **VIEW** только **читают** и **упрощают отображение**.

---

## Кому нужны в проекте

| Кто | Зачем |
|-----|--------|
| **Dashboard / API** | Каталог оборудования с названиями категории и лаборатории |
| **Список броней** | Видно кто, что и когда забронировал без ручных JOIN |
| **Админ лаборатории** | `v_users_by_organization` — пользователи с названием орг. |
| **Отчёт / phpMyAdmin** | Готовые выборки для пояснительной записки |
| **Задание по курсу** | Требование «необходимые представления для UI» |

Пользователь в браузере не видит имя VIEW — он получает уже **обогащённый JSON** из API.

---

## Список представлений

| VIEW | Назначение | Используется в |
|------|------------|----------------|
| `v_equipment_catalog` | Каталог оборудования + категория + организация + подпись статуса | `GET /api/equipment` |
| `v_bookings_detail` | Брони + пользователь + оборудование + организация | `GET /api/bookings`, `GET /api/bookings/:id` |
| `v_active_bookings` | Только `active` брони (календарь, занятость) | отчёты, будущий UI календаря |
| `v_users_by_organization` | Пользователи с названием лаборатории | будущий админ-API, SQL-отчёты |

---

## Как используются в коде

### Оборудование (`equipmentService.js`)

```javascript
// было: SELECT * FROM equipment
// стало:
SELECT * FROM v_equipment_catalog
```

Ответ API для dashboard теперь содержит, например:

- `equipment_name`, `category_name`, `organization_name`, `status_label`

### Бронирования (`bookingsService.js`)

```javascript
// было: SELECT * FROM bookings
// стало:
SELECT * FROM v_bookings_detail
```

В списке броней видны `user_name`, `equipment_name`, `booking_status_label`.

**Запись** по-прежнему через **процедуры** (`sp_create_booking` и др.) — VIEW не заменяют INSERT/UPDATE.

---

## Примеры SQL

```sql
-- Каталог только доступного оборудования лаборатории 1
SELECT * FROM v_equipment_catalog
WHERE organization_id = 1 AND status = 'available';

-- Активные брони на завтра
SELECT * FROM v_active_bookings
WHERE start_time >= CURDATE() AND start_time < CURDATE() + INTERVAL 1 DAY;

-- Пользователи лаборатории химии
SELECT * FROM v_users_by_organization WHERE organization_id = 1;
```

---

## VIEW vs процедуры

| | VIEW | PROCEDURE |
|---|------|-----------|
| Операция | Только чтение | Изменение + проверки |
| Пример | `v_bookings_detail` | `sp_create_booking` |
| В API | `SELECT` | `CALL` |

---

## Связанные документы

- [09-stored-procedures.md](09-stored-procedures.md)
- [03-tables.md](03-tables.md)
- [07-sequence-diagram.md](07-sequence-diagram.md) — шаг GET equipment


# команды для запуска в терминале(CMD)

найти файл расположения Mysql терминала + запуск программа-клиент, которая подключается к серверу базы данных:

1. C:\xampp\mysql\bin\mysql.exe -u root -p
-u = user (пользователь)
root = имя пользователя базы данных
-p = password
2.  USE lab_equipment_booking;
Выбери базу данных

3. SOURCE C:/PROJECTS/lab-equipment-booking-saas/database/view.sql;
выполняет SQL-файл целиком внутри текущей базы данных

4. SHOW TABLES; 

5. SHOW FULL TABLES WHERE TABLE_TYPE = 'VIEW';
показывает все объекты в текущей базе
фильтрует только VIEW

6. SHOW CREATE VIEW v_active_bookings;
показывает SQL-код, который создаёт это VIEW
позволяет понять:
какие таблицы используются
какие JOIN / SELECT внутри
логика представления