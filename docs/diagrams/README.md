# Диаграммы проекта (draw.io)

Основной инструмент: [diagrams.net](https://app.diagrams.net) (draw.io).

## ERD

| Файл | Назначение |
|------|------------|
| `lab-equipment-booking-erd.drawio` | ERD базы `lab_equipment_booking` — открыть, править, экспорт PNG/PDF для отчёта |

## CRUD-матрица

| Файл | Назначение |
|------|------------|
| `crud-matrix.drawio` | Таблица доступа **6 ролей × 5 таблиц** — основной артефакт для отчёта |

Текстовая копия (справочно): [`../04-crud-matrix.md`](../04-crud-matrix.md).

**Как работать:**

1. **File → Open from → Device** → выберите `.drawio`.
2. Редактируйте схему.
3. **File → Export as → PNG** или **PDF** для пояснительной записки.

Согласовано с [`database/schema.sql`](../../database/schema.sql) и [`../03-tables.md`](../03-tables.md).

## Use Case

| Файл | Назначение |
|------|------------|
| `use-case.drawio` | Диаграмма вариантов использования (6 ролей + LIMS) |

Описание сценариев: [`../05-use-case.md`](../05-use-case.md).

## Диаграммы состояний

| Файл | Назначение |
|------|------------|
| `booking-states.drawio` | Состояния **bookings** и **equipment** (2 автомата на одном листе) |

Описание переходов: [`../06-state-diagram.md`](../06-state-diagram.md).

## Диаграмма последовательности

| Файл | Назначение |
|------|------------|
| `booking-sequence.drawio` | Создание бронирования: браузер → API → JWT → MySQL |

Описание: [`../07-sequence-diagram.md`](../07-sequence-diagram.md).

## Диаграмма действий (Activity)

| Файл | Назначение |
|------|------------|
| `booking-activity.drawio` | Алгоритм UC-30 с дорожками и условиями |

Описание: [`../08-activity-diagram.md`](../08-activity-diagram.md).

## Visual Paradigm

Не обязателен. При необходимости можно импортировать `.drawio` через VP Online (**Import draw.io**), но для проекта достаточно экспорта из draw.io.
