# lab-equipment-booking-saas

Облачный SaaS для бронирования лабораторного оборудования с REST API и интеграцией с LIMS.

## Документация проекта

| Документ | Содержание |
|----------|------------|
| [docs/01-introduction.md](docs/01-introduction.md) | Введение, цели, задачи |
| [docs/02-users-and-roles.md](docs/02-users-and-roles.md) | 6 ролей пользователей |
| [docs/03-tables.md](docs/03-tables.md) | Описание таблиц БД |
| [docs/04-crud-matrix.md](docs/04-crud-matrix.md) | CRUD-матрица (6 ролей × 5 таблиц) |
| [docs/05-use-case.md](docs/05-use-case.md) | Use Case; диаграмма: [docs/diagrams/use-case.drawio](docs/diagrams/use-case.drawio) |
| [docs/06-state-diagram.md](docs/06-state-diagram.md) | Состояния; [docs/diagrams/booking-states.drawio](docs/diagrams/booking-states.drawio) |
| [docs/07-sequence-diagram.md](docs/07-sequence-diagram.md) | Последовательность; [docs/diagrams/booking-sequence.drawio](docs/diagrams/booking-sequence.drawio) |
| [docs/08-activity-diagram.md](docs/08-activity-diagram.md) | Действия; [docs/diagrams/booking-activity.drawio](docs/diagrams/booking-activity.drawio) |

## База данных

Канонические скрипты: [`database/`](database/) (`schema.sql`, `seed.sql`).

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Демо-пароль: `Password123!` — см. [database/README.md](database/README.md).

## Запуск API

```bash
cd server
npm install
npm start
```

## Tech Stack

- Node.js, Express, MySQL, JWT, Jade UI
