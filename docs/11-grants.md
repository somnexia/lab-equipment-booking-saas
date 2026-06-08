# Права пользователей MySQL (GRANT)

Файл: [`database/grants.sql`](../database/grants.sql)

## Установка

```bash
mysql -u root -p < database/grants.sql
```

Выполнять **после** `schema.sql`, `seed.sql`, `procedures.sql`, `views.sql`.

---

## Для чего нужны GRANT

В проекте **два уровня доступа**:

| Уровень | Где | Пример |
|---------|-----|--------|
| **Приложение** | `users.role` + JWT | `student`, `researcher` |
| **База данных** | `CREATE USER` + `GRANT` | `app_student`, `app_researcher` |

**GRANT** отвечает на вопрос: *«Что этот логин MySQL может делать с таблицами?»*

- `SELECT` — читать  
- `INSERT`, `UPDATE`, `DELETE` — менять таблицы напрямую  
- `EXECUTE` — вызывать хранимые процедуры  
- `ALL PRIVILEGES` — полный доступ к схеме  

Это требование задания: *«SQL-запросы для создания пользователей и назначения прав»* и связь с **CRUD-матрицей**.

---

## Кому нужны права MySQL

| Кто | Зачем |
|-----|--------|
| **Node.js (`labuser`)** | Подключение из `.env`; сейчас полный доступ для разработки |
| **Демо-пользователи `app_*`** | Показать принцип «минимальных прав» в отчёте и тест в phpMyAdmin |
| **Администратор БД** | Разделение обязанностей: студент не может `DELETE` из `equipment` |
| **Преподаватель** | Видит связь CRUD-матрицы → SQL-прав |

Пользователь в браузере **не вводит** `app_student` — он логинится в приложение. Учётки MySQL — слой **инфраструктуры** (как в реальном SaaS: сервис подключается к БД под своим логином).

---

## Как обычно используются

### 1. Одно подключение приложения (ваш случай сейчас)

```
Express (.env: labuser) → ALL на lab_equipment_booking
```

Роли `student` / `researcher` проверяются в **JWT + процедурах** (`sp_create_booking`).

### 2. Строгая модель (для отчёта и демо)

```
app_student     → SELECT на VIEW + EXECUTE на sp_* бронирования
app_technician  → SELECT + EXECUTE sp_update_equipment_status
app_readonly    → только SELECT на VIEW
```

Студент **не может** напрямую `INSERT INTO bookings` — только `CALL sp_create_booking` (если подключиться под `app_student`).

### 3. Проверка в phpMyAdmin

1. Выйти из root.  
2. Войти как `app_student` / пароль из `grants.sql`.  
3. `SELECT * FROM v_equipment_catalog` — работает.  
4. `DELETE FROM equipment` — **отказ в доступе**.

---

## Пользователи в `grants.sql`

| MySQL user | Роль приложения | Суть прав |
|------------|-----------------|-----------|
| `labuser` | Сервис Node.js | ALL (разработка) |
| `app_system_admin` | `system_admin` | ALL на схему |
| `app_lab_admin` | `lab_admin` | CRUD таблиц + VIEW + все процедуры |
| `app_equipment_mgr` | `equipment_manager` | CRUD equipment/categories, SELECT bookings |
| `app_researcher` | `researcher` | SELECT + процедуры бронирования |
| `app_student` | `student` | SELECT только VIEW + EXECUTE бронирования |
| `app_technician` | `technician` | SELECT + `sp_update_equipment_status` |
| `app_readonly` | Отчёты | SELECT на VIEW |

Пароли в файле — заглушки `ChangeMe_*`. **Совпадают с вашим `labuser` в `.env` только если вы сами их зададите.**

---

## Связь с VIEW и процедурами

```text
app_student:
  ✅ SELECT v_equipment_catalog
  ✅ CALL sp_create_booking(...)
  ❌ INSERT INTO bookings
  ❌ UPDATE equipment
```

Логика:

- **VIEW** — безопасное **чтение** (готовые JOIN).  
- **PROCEDURE** — безопасная **запись** с проверками.  
- **GRANT** — кто может вызывать VIEW и процедуры.

---

## Два уровня безопасности (для отчёта)

```mermaid
flowchart LR
  U[Пользователь в браузере] --> API[Express + JWT role]
  API --> DB[(MySQL labuser)]
  DB --> SP[sp_create_booking]
  SP --> T[bookings]
```

1. **API:** middleware `authorize(['student', ...])`  
2. **БД:** процедура проверяет организацию, конфликт слотов  
3. **GRANT (демо):** `app_student` не имеет прямого INSERT  

---

# команды для запуска в терминале(CMD)

```sql

1. C:\xampp\mysql\bin\mysql.exe -u root -p
-u = user (пользователь)
root = имя пользователя базы данных
-p = password
2.  USE lab_equipment_booking;
Выбери базу данных

3. SOURCE C:/PROJECTS/lab-equipment-booking-saas/database/view.sql;
выполняет SQL-файл целиком внутри текущей базы данных

4 .SHOW GRANTS FOR 'app_student'@'localhost';
Просмотр прав пользователя

-- Отозвать право (при необходимости)
REVOKE DELETE ON lab_equipment_booking.* FROM 'app_student'@'localhost';
FLUSH PRIVILEGES;


# остальные важные команды  MySQL (для прав доступа)

1. Создать пользователя
CREATE USER 'user'@'localhost' IDENTIFIED BY 'password';
2. Выдать все права на базу (самая важная команда)
GRANT ALL PRIVILEGES ON database_name.* TO 'user'@'localhost';
3. Выдать только нужные права (очень часто используется)
GRANT SELECT, INSERT, UPDATE, DELETE ON database_name.* TO 'user'@'localhost';
4. Посмотреть права пользователя
SHOW GRANTS FOR 'user'@'localhost';
5. Забрать права
REVOKE ALL PRIVILEGES ON database_name.* FROM 'user'@'localhost';
6. Удалить пользователя
DROP USER 'user'@'localhost';
7. Обновить пароль
ALTER USER 'user'@'localhost' IDENTIFIED BY 'new_password';
8. Применить изменения (иногда нужно)
FLUSH PRIVILEGES;

---

## Связанные документы

- [04-crud-matrix.md](04-crud-matrix.md)
- [09-stored-procedures.md](09-stored-procedures.md)
- [10-views.md](10-views.md)
- [02-users-and-roles.md](02-users-and-roles.md)

