# Описание структуры таблиц

База данных: **`lab_equipment_booking`**.  
Скрипт создания: [`database/schema.sql`](../database/schema.sql).

## ERD-диаграмма

Файл: [`diagrams/lab-equipment-booking-erd.drawio`](diagrams/lab-equipment-booking-erd.drawio) (draw.io).  
Инструкция: [`diagrams/README.md`](diagrams/README.md).

## Чем это отличается от `schema.sql`?

| `schema.sql` | `03-tables.md` |
|--------------|----------------|
| Машиночитаемый DDL для СУБД | Текст для отчёта и преподавателя |
| `CREATE TABLE`, индексы, FK | Назначение полей **простым языком** |
| Без пояснения ролей и правил | ENUM-статусы, бизнес-правила, связь с ролями |

SQL и описание таблиц **согласованы**, но не дублируют друг друга дословно: в SQL — синтаксис, в документе — смысл и огранич предметной области.

## ER-связи (кратко)

```
organizations 1 ── * users
organizations 1 ── * equipment_categories
organizations 1 ── * equipment
equipment_categories 1 ── * equipment
equipment 1 ── * bookings
users 1 ── * bookings
```

## Таблица `organizations`

Лаборатория / факультет / научная группа как tenant в SaaS.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT, PK, AI | Идентификатор организации |
| `name` | VARCHAR(255) | Название лаборатории |
| `description` | TEXT | Описание, адрес, контакты |
| `created_at` | TIMESTAMP | Дата создания записи |

## Таблица `users`

Учётные записи с ролью и привязкой к организации.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT, PK, AI | Идентификатор пользователя |
| `organization_id` | INT, FK → organizations | Лаборатория пользователя |
| `name` | VARCHAR(255) | ФИО или отображаемое имя |
| `email` | VARCHAR(255), UNIQUE | Логин |
| `password_hash` | TEXT | Хеш пароля (bcrypt) |
| `role` | ENUM | Роль (см. [02-users-and-roles.md](02-users-and-roles.md)) |
| `created_at` | TIMESTAMP | Дата регистрации |

**Роли (`role`):**  
`system_admin`, `lab_admin`, `equipment_manager`, `researcher`, `student`, `technician`.

## Таблица `equipment_categories`

Группировка оборудования (посуда, электроника, измерительные приборы).

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT, PK, AI | Идентификатор категории |
| `organization_id` | INT, FK | Организация-владелец |
| `name` | VARCHAR(255) | Название категории |
| `description` | TEXT | Комментарий |
| `created_at` | TIMESTAMP | Дата создания |

## Таблица `equipment`

Единица оборудования, доступная для бронирования.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT, PK, AI | Идентификатор |
| `organization_id` | INT, FK | Лаборатория |
| `category_id` | INT, FK, NULL | Категория (опционально) |
| `name` | VARCHAR(255) | Название прибора |
| `description` | TEXT | Характеристики |
| `status` | ENUM | `available` — доступно; `maintenance` — ТО; `broken` — неисправно |
| `created_at` | TIMESTAMP | Дата добавления |

## Таблица `bookings`

Бронирование оборудования на интервал времени.

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | INT, PK, AI | Идентификатор брони |
| `equipment_id` | INT, FK | Оборудование |
| `user_id` | INT, FK | Кто забронировал |
| `start_time` | DATETIME | Начало слота |
| `end_time` | DATETIME | Конец слота |
| `status` | ENUM | `active`, `completed`, `cancelled` |
| `created_at` | TIMESTAMP | Момент создания брони |

## Бизнес-правила (на уровне данных)

1. `end_time` должно быть позже `start_time` (проверка в приложении / триггере — планируется).
2. Оборудование со статусом `broken` или `maintenance` не должно принимать новые брони `active` (планируется в процедуре бронирования).
3. Пользователь видит данные в рамках своей `organization_id` (планируется в VIEW и API).

## Словари значений ENUM

### `users.role`

`system_admin`, `lab_admin`, `equipment_manager`, `researcher`, `student`, `technician` — см. [02-users-and-roles.md](02-users-and-roles.md).

### `equipment.status`

| Значение | Смысл |
|----------|--------|
| `available` | Можно бронировать |
| `maintenance` | Техобслуживание, бронь запрещена |
| `broken` | Неисправно, бронь запрещена |

### `bookings.status`

| Значение | Смысл |
|----------|--------|
| `active` | Актуальная бронь |
| `completed` | Слот завершён |
| `cancelled` | Отменена пользователем или админом |

## Следующие артефакты

- CRUD-матрица: [04-crud-matrix.md](04-crud-matrix.md)
- Use Case, диаграммы состояний: `docs/diagrams/`
- Представления: [10-views.md](10-views.md) (`database/views.sql`)
- Процедуры: [09-stored-procedures.md](09-stored-procedures.md) (`database/procedures.sql`)
