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
