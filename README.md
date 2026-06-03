# lab-equipment-booking-saas

Облачный SaaS для бронирования лабораторного оборудования с REST API и интеграцией с LIMS.

## Документация проекта

| Документ | Содержание |
|----------|------------|
| [docs/01-introduction.md](docs/01-introduction.md) | Введение, цели, задачи |
| [docs/02-users-and-roles.md](docs/02-users-and-roles.md) | 6 ролей пользователей |
| [docs/03-tables.md](docs/03-tables.md) | Описание таблиц БД |

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
