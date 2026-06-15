# Хранимые процедуры и функции

Файл: [`database/procedures.sql`](../database/procedures.sql)

## Установка

После `schema.sql` и `seed.sql`:

```bash
mysql -u root -p lab_equipment_booking < database/procedures.sql
```

В phpMyAdmin: вкладка SQL → вставить содержимое файла (с `DELIMITER`).

---

## Соответствие функционалу приложения

| Процедура / функция | API / сценарий | Роли (приложение) |
|---------------------|----------------|-------------------|
| `fn_booking_has_conflict` | Внутренняя проверка | — |
| `sp_create_booking` | `POST /api/bookings` | student, researcher, lab_admin, system_admin |
| `sp_update_booking` | `PUT /api/bookings/:id` (время) | те же + только `active` |
| `sp_cancel_booking` | `DELETE /api/bookings/:id` | student (своя), researcher, lab_admin, system_admin |
| `sp_complete_booking` | `PUT` с `status: completed` | student (своя), researcher, lab_admin, system_admin |
| `sp_update_equipment_status` | `PUT /api/equipment/:id` (`status`) | technician, equipment_manager, lab_admin, system_admin |

---

## Проверки в `sp_create_booking`

1. `end_time` > `start_time`
2. Оборудование существует и `status = available`
3. Пользователь существует, та же `organization_id`, что и у оборудования
4. Актор может бронировать в этой организации (кроме `system_admin`)
5. Студент бронирует только на себя (`user_id = actor_id`)
6. Нет пересечения с другими `active` бронями на то же оборудование

Результат: `INSERT` со статусом `active` + `SELECT booking_id, status, result`.

---

## Примеры вызова (SQL)

```sql
-- Создать бронь от имени студента id=5
CALL sp_create_booking(1, 5, '2026-06-15 10:00:00', '2026-06-15 12:00:00', 5, 'student');

-- Отменить
CALL sp_cancel_booking(1, 5, 'student');

-- Техник: перевести весы в ТО
CALL sp_update_equipment_status(3, 'maintenance', 6, 'technician');
```

---

## Связь с диаграммами

- [07-sequence-diagram.md](07-sequence-diagram.md) — шаг INSERT заменяется на `CALL sp_create_booking`
- [08-activity-diagram.md](08-activity-diagram.md) — ромбы «available» и «конфликт» реализованы в процедуре
- [06-state-diagram.md](06-state-diagram.md) — `cancelled` / `completed` через `sp_cancel_*` / `sp_complete_*`

---

## Ошибки

При нарушении правила MySQL возвращает `SQLSTATE 45000` и `MESSAGE_TEXT`.  
Node.js передаёт текст в ответ API (`err.sqlMessage`).

# команды для запуска в терминале(CMD)
```sql

1. C:\xampp\mysql\bin\mysql.exe -u root -p
-u = user (пользователь)
root = имя пользователя базы данных
-p = password
2.  USE lab_equipment_booking;
Выбери базу данных

3. SOURCE C:/PROJECTS/lab-equipment-booking-saas/database/procedures.sql;
выполняет SQL-файл целиком внутри текущей базы данных

```

# другие важные  команды MySQL для процедур(CMD)

```sql
1. Создание процедуры
DELIMITER //

CREATE PROCEDURE procedure_name()
BEGIN
    SELECT 'Hello';
END //

DELIMITER ;
Объяснение:
DELIMITER // → меняет символ конца команды (нужно для процедур)
CREATE PROCEDURE → создание процедуры
BEGIN ... END → тело процедуры
2. Вызов процедуры
CALL procedure_name();
3. Удаление процедуры
DROP PROCEDURE procedure_name;
4. Просмотр списка процедур
SHOW PROCEDURE STATUS WHERE Db = 'database_name';
5. Просмотр структуры процедуры
SHOW CREATE PROCEDURE procedure_name;
6. Процедура с параметрами (очень важно)
IN (входной параметр)
DELIMITER //

CREATE PROCEDURE get_user(IN user_id INT)
BEGIN
    SELECT * FROM users WHERE id = user_id;
END //

DELIMITER ;

Вызов:

CALL get_user(1);
OUT (выходной параметр)
DELIMITER //

CREATE PROCEDURE count_users(OUT total INT)
BEGIN
    SELECT COUNT(*) INTO total FROM users;
END //

DELIMITER ;

Вызов:

CALL count_users(@total);
SELECT @total;
INOUT (вход + выход)
DELIMITER //

CREATE PROCEDURE increase_value(INOUT x INT)
BEGIN
    SET x = x + 1;
END //

DELIMITER ;
7. Важное правило (частая ошибка)

❌ нельзя писать процедуры без DELIMITER

✔ всегда:

DELIMITER //
...
END //
DELIMITER ;

```