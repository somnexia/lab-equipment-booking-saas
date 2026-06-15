# lab-equipment-booking-saas

Cloud SaaS for booking laboratory equipment with a REST API and LIMS integration.

## Project documentation

| Document | Contents |
|----------|----------|
| [docs/01-introduction.md](docs/01-introduction.md) | Introduction, goals, tasks |
| [docs/02-users-and-roles.md](docs/02-users-and-roles.md) | 6 user roles |
| [docs/03-tables.md](docs/03-tables.md) | Database table descriptions |
| [docs/04-crud-matrix.md](docs/04-crud-matrix.md) | CRUD matrix (6 roles × 5 tables) |
| [docs/05-use-case.md](docs/05-use-case.md) | Use cases; diagram: [docs/diagrams/use-case.drawio](docs/diagrams/use-case.drawio) |
| [docs/06-state-diagram.md](docs/06-state-diagram.md) | States; [docs/diagrams/booking-states.drawio](docs/diagrams/booking-states.drawio) |
| [docs/07-sequence-diagram.md](docs/07-sequence-diagram.md) | Sequence; [docs/diagrams/booking-sequence.drawio](docs/diagrams/booking-sequence.drawio) |
| [docs/08-activity-diagram.md](docs/08-activity-diagram.md) | Activity; [docs/diagrams/booking-activity.drawio](docs/diagrams/booking-activity.drawio) |

## Database

Canonical scripts: [`database/`](database/) (`schema.sql`, `seed.sql`).

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed.sql
```

Demo password: `Password123!` — see [database/README.md](database/README.md).

## Run the API

```bash
cd server
npm install
npm start
```

## Tech stack

- Node.js, Express, MySQL, JWT, Jade UI
