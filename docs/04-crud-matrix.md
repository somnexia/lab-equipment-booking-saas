# CRUD-матрица доступа

Информационная система **Lab Equipment Booking SaaS**.  
Сущности: 5 таблиц БД. Субъекты: 6 ролей пользователей.

## Основной артефакт (draw.io)

**Таблица для отчёта:** [`diagrams/crud-matrix.drawio`](diagrams/crud-matrix.drawio)

1. Откройте в [diagrams.net](https://app.diagrams.net).
2. При необходимости подправьте оформление.
3. **File → Export as → PNG/PDF** для пояснительной записки.

Ниже — текстовая версия (дублирует draw.io, удобна для поиска и Git).

Связанные документы: [02-users-and-roles.md](02-users-and-roles.md), [03-tables.md](03-tables.md), `server/config/roles.js`.

---

## Условные обозначения

| Символ | Значение |
|--------|----------|
| **C** | Create — создание записи |
| **R** | Read — просмотр |
| **U** | Update — изменение всех полей записи |
| **U*** | Update частичный (только указанные поля) |
| **D** | Delete — удаление записи |
| **—** | Нет доступа |
| **Rᴏ** | Read только своей организации (`organization_id` пользователя) |
| **Rˢ** | Read только своих записей (например, `user_id = текущий пользователь`) |
| **Cᴏ** / **Uᴏ** / **Dᴏ** | Create / Update / Delete в рамках своей организации |
| **Cˢ** / **Uˢ** | Create / Update только своих записей |

> **Область видимости:** все роли, кроме `system_admin`, работают в пределах своей `organization_id`, если не указано иное.

---

## Сводная матрица (5 × 6)

| Сущность / Таблица | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------------------|:------------:|:---------:|:-----------------:|:----------:|:-------:|:----------:|
| **organizations** | CRUD | Rᴏ Uᴏ* | Rᴏ | — | — | — |
| **users** | CRUD | CRUDᴏ | Rᴏ | Rˢ Uˢ | Rˢ Uˢ | Rˢ Uˢ |
| **equipment_categories** | CRUD | CRUDᴏ | CRUDᴏ | Rᴏ | Rᴏ | Rᴏ |
| **equipment** | CRUD | CRUDᴏ | CRUDᴏ | Rᴏ | Rᴏ | Rᴏ U*** |
| **bookings** | CRUD | CRUDᴏ | Rᴏ | CRUDᴏ | Cˢ Rᴏ Uˢ | Rᴏ |

\* *lab_admin* может менять данные **своей** организации, но не создавать новые организации.  
\*\* *technician* — только поле `equipment.status` (`maintenance`, `broken`, `available`).

---

## Детализация по сущностям

### 1. `organizations` (организации / лаборатории)

| Операция | system_admin | lab_admin | Остальные роли |
|----------|--------------|-----------|----------------|
| C | Все организации | — | — |
| R | Все | Своя организация | — |
| U | Все | Своя (name, description) | — |
| D | Все | — | — |

**Назначение:** мультитенантность SaaS; лаборатория — tenant.

---

### 2. `users` (пользователи)

| Операция | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|--------------|-----------|-------------------|------------|---------|------------|
| C | Любая орг., любая роль | Только своя орг. | — | — | — | — |
| R | Все | Своя орг. | Своя орг. | Свой профиль | Свой профиль | Свой профиль |
| U | Все поля | Пользователи своей орг. | — | Свой профиль (не role) | Свой профиль | Свой профиль |
| D | Все | Пользователи своей орг. | — | — | — | — |

**Ограничения:**

- Менять `role` может только `system_admin` и `lab_admin` (в своей орг.).
- Самостоятельная регистрация через UI → роль `student` по умолчанию.

---

### 3. `equipment_categories` (категории оборудования)

| Операция | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|--------------|-----------|-------------------|------------|---------|------------|
| C | Да | Своя орг. | Своя орг. | — | — | — |
| R | Все | Своя орг. | Своя орг. | Своя орг. | Своя орг. | Своя орг. |
| U | Да | Своя орг. | Своя орг. | — | — | — |
| D | Да | Своя орг. | Своя орг. | — | — | — |

---

### 4. `equipment` (оборудование)

| Операция | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|--------------|-----------|-------------------|------------|---------|------------|
| C | Да | Своя орг. | Своя орг. | — | — | — |
| R | Все | Своя орг. | Своя орг. | Своя орг. | Своя орг. | Своя орг. |
| U | Все поля | Своя орг. | Своя орг. | — | — | Только `status` |
| D | Да | Своя орг. | Своя орг. | — | — | — |

**Статусы (`status`):** `available`, `maintenance`, `broken`.

---

### 5. `bookings` (бронирования)

| Операция | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|--------------|-----------|-------------------|------------|---------|------------|
| C | Да | Своя орг. | — | Своя орг. | Только на себя (`user_id`) | — |
| R | Все | Своя орг. | Своя орг. | Своя орг. | Своя орг. / свои* | Своя орг. |
| U | Все | Своя орг. | — | Своя орг. | Только свои активные | — |
| D | Да | Своя орг. | — | Своя орг. | —** | — |

\* *student* на практике видит каталог и свои брони; чужие брони — только слоты в расписании (без персональных данных) — на усмотрение реализации.  
\*\* *student* отменяет бронь через **U** (`status = cancelled`), без физического **D**.

**Бизнес-ограничения (целевая модель):**

- Нельзя создать бронь на оборудование со статусом `maintenance` / `broken`.
- Нельзя пересекать активные брони (`status = active`) на одно оборудование.
- `equipment` и `user` должны принадлежать одной `organization_id`.

---

## Матрица по операциям CRUD (развёрнутая)

### Create (C)

| Сущность | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| organizations | ✓ | — | — | — | — | — |
| users | ✓ | ✓ᴏ | — | — | — | — |
| equipment_categories | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| equipment | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| bookings | ✓ | ✓ᴏ | — | ✓ᴏ | ✓ˢ | — |

### Read (R)

| Сущность | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| organizations | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| users | ✓ | ✓ᴏ | ✓ᴏ | ✓ˢ | ✓ˢ | ✓ˢ |
| equipment_categories | ✓ | ✓ᴏ | ✓ᴏ | ✓ᴏ | ✓ᴏ | ✓ᴏ |
| equipment | ✓ | ✓ᴏ | ✓ᴏ | ✓ᴏ | ✓ᴏ | ✓ᴏ |
| bookings | ✓ | ✓ᴏ | ✓ᴏ | ✓ᴏ | ✓ᴏ/✓ˢ | ✓ᴏ |

### Update (U)

| Сущность | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| organizations | ✓ | ✓ᴏ | — | — | — | — |
| users | ✓ | ✓ᴏ | — | ✓ˢ | ✓ˢ | ✓ˢ |
| equipment_categories | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| equipment | ✓ | ✓ᴏ | ✓ᴏ | — | — | ✓* |
| bookings | ✓ | ✓ᴏ | — | ✓ᴏ | ✓ˢ | — |

\* только `equipment.status` для technician.

### Delete (D)

| Сущность | system_admin | lab_admin | equipment_manager | researcher | student | technician |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| organizations | ✓ | — | — | — | — | — |
| users | ✓ | ✓ᴏ | — | — | — | — |
| equipment_categories | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| equipment | ✓ | ✓ᴏ | ✓ᴏ | — | — | — |
| bookings | ✓ | ✓ᴏ | — | ✓ᴏ | — | — |

---

## Соответствие REST API (текущая реализация)

Реализовано в `server/routes/api/` на момент составления матрицы:

| Ресурс | Метод | Маршрут | Роли (middleware) | Примечание |
|--------|-------|---------|-------------------|------------|
| equipment | GET | `/api/equipment` | Все 6 ролей | Нет фильтра по `organization_id` в SQL |
| equipment | POST/DELETE | `/api/equipment` | system_admin, lab_admin, equipment_manager | |
| equipment | PUT | `/api/equipment/:id` | + technician (статус) | |
| bookings | GET | `/api/bookings` | Все, кроме гостя | Нет фильтра по орг. |
| bookings | POST, PUT | `/api/bookings` | system_admin, lab_admin, researcher, student | |
| bookings | DELETE | `/api/bookings/:id` | system_admin, lab_admin, researcher | student → нет DELETE |
| auth | POST | `/api/auth/register` | Публично | Роль `student` по умолчанию |

**Ещё не реализовано в API (есть только в матрице / планах):**

- CRUD `organizations`, `users`, `equipment_categories` (отдельные маршруты).
- Проверка `organization_id` и «своих» броней для student.
- Проверка конфликтов слотов при создании брони.

---

## Соответствие правам MySQL (`GRANT`)

Реализовано в [`database/grants.sql`](../database/grants.sql) — см. [11-grants.md](11-grants.md).

| Пользователь БД | Роль приложения | Типичный доступ |
|-----------------|-----------------|----------------|
| `labuser` | Подключение Node.js | ALL (режим разработки) |
| `app_system_admin` | system_admin | ALL на схему |
| `app_lab_admin` | lab_admin | CRUD таблиц + VIEW + процедуры |
| `app_equipment_mgr` | equipment_manager | CRUD equipment, categories |
| `app_researcher` | researcher | SELECT + процедуры бронирования |
| `app_student` | student | SELECT VIEW + EXECUTE бронирования |
| `app_technician` | technician | SELECT + `sp_update_equipment_status` |
| `app_readonly` | отчёты | SELECT на VIEW |

---

## Диаграмма связи ролей и сущностей

```
                    [system_admin] ──► все таблицы
                           │
              [lab_admin] ─┴─► organizations (своя), users, categories,
                               equipment, bookings (всё в своей орг.)
                           │
        [equipment_manager] ──► categories, equipment (CRUDᴏ), bookings (Rᴏ)
                           │
           [researcher] ──────► equipment (Rᴏ), bookings (CRUDᴏ)
                           │
              [student] ──────► equipment (Rᴏ), bookings (Cˢ R Uˢ)
                           │
           [technician] ─────► equipment (Rᴏ, U status), bookings (Rᴏ)
```

---

## История изменений

| Версия | Дата | Изменение |
|--------|------|-----------|
| 1.0 | 2026-06 | Первая версия: 5 таблиц, 6 ролей |
