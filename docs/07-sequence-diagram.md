# Диаграмма последовательности

## Файл диаграммы

**[`diagrams/booking-sequence.drawio`](diagrams/booking-sequence.drawio)** — сценарий **«Создание бронирования»** (UC-30).

Открыть в [diagrams.net](https://app.diagrams.net) → экспорт PNG/PDF для отчёта.

---

## Цель сценария

Показать взаимодействие компонентов при создании брони оборудования: от входа пользователя до записи `bookings.status = active` в MySQL.

## Участники (lifelines)

| Участник | Реализация в проекте |
|----------|----------------------|
| Пользователь | student / researcher |
| Браузер | Jade-шаблоны + `fetch` (`dashboard.jade`, `login.jade`) |
| Express Router | `server/routes/api/bookings.js`, `auth.js` |
| authMiddleware | `server/middlewares/authMiddleware.js` (JWT из cookie) |
| BookingsController | `server/controllers/bookingsController.js` |
| BookingsService | `server/services/bookingsService.js` |
| MySQL | БД `lab_equipment_booking`, таблицы `users`, `equipment`, `bookings` |

---

## Основной поток (сообщения 6–20)

| № | От → К | Действие |
|---|--------|----------|
| 6 | Пользователь → Браузер | Открыть `/dashboard` |
| 7 | Браузер → API | `GET /api/equipment` (cookie с JWT) |
| 8–9 | API ↔ authMiddleware | Проверка токена, `req.user` |
| 10–11 | API ↔ MySQL | `SELECT` оборудования → JSON каталога |
| 12 | Пользователь → Браузер | Выбор прибора и временного слота |
| 13 | Браузер → API | `POST /api/bookings` + тело JSON |
| 14 | API ↔ authMiddleware | `authenticate` + `authorize` (роли из CRUD-матрицы) |
| 15–16 | API → Controller → Service | `create(req.body)` |
| 17 | Service → MySQL | `INSERT INTO bookings` (`status = active`) |
| 18–20 | Ответ до пользователя | `201 Created`, отображение результата |

---

## Фрагмент alt (сообщения 1–5)

Если пользователь **не авторизован**, перед основным потоком выполняется:

| № | Действие |
|---|----------|
| 1–2 | Открытие `/auth/login`, `POST /api/auth/login` |
| 3–4 | Проверка `users` + bcrypt |
| 5 | Установка HttpOnly cookie с JWT |

---

## Связь с другими артефактами

| Артефакт | Связь |
|----------|--------|
| [05-use-case.md](05-use-case.md) | UC-30 «Создать бронирование», `<<include>>` каталог |
| [06-state-diagram.md](06-state-diagram.md) | После INSERT → состояние `active` |
| [04-crud-matrix.md](04-crud-matrix.md) | POST bookings для student, researcher, lab_admin |
| `database/schema.sql` | Структура `bookings` |

---

## Планируемые изменения (на диаграмме — note)

Вместо прямого `INSERT` в Service:

1. Вызов **`sp_create_booking`** в MySQL.
2. Проверка `equipment.status = available`.
3. Проверка пересечения активных броней.
4. Проверка `organization_id` пользователя и оборудования.

---

## Соответствие коду

| Шаг | Файл |
|-----|------|
| POST /api/bookings | `server/routes/api/bookings.js` |
| JWT | `server/middlewares/authMiddleware.js` |
| create | `server/controllers/bookingsController.js` |
| INSERT | `server/services/bookingsService.js` |
| GET equipment | `server/routes/api/equipment.js`, `equipmentService.js` |
| login | `server/controllers/authController.js` |
