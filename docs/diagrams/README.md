# Project diagrams (draw.io)

Tool: [diagrams.net](https://app.diagrams.net) (draw.io).  
Diagrams use a **clean, minimal** style: white shapes, gray borders, Helvetica — easy to read in reports.

## ERD

| File | Purpose |
|------|---------|
| `lab-equipment-booking-erd.drawio` | Entity–relationship diagram for `lab_equipment_booking` — 5 tables, FK links, ENUM notes |

**Shows:** static **data model** — what is stored and how tables relate (`organizations` → `users`, `equipment`, `bookings`).

## CRUD matrix

| File | Purpose |
|------|---------|
| `crud-matrix.drawio` | Access table **6 roles × 5 tables** — main security artifact for the report |

Text reference: [`../04-crud-matrix.md`](../04-crud-matrix.md).

**Shows:** who can Create / Read / Update / Delete each entity (permissions only, not workflow).

## Use case

| File | Purpose |
|------|---------|
| `use-case.drawio` | Use cases — 6 human roles + LIMS external actor |

Scenario list: [`../05-use-case.md`](../05-use-case.md).

**Shows:** **what users can do** with the system (goals), grouped by Auth, Admin, Equipment, Bookings, API.

## State diagrams

| File | Purpose |
|------|---------|
| `booking-states.drawio` | State machines for **bookings.status** and **equipment.status** (two automata on one page) |

Transitions: [`../06-state-diagram.md`](../06-state-diagram.md).

**Shows:** **allowed status values** and **transitions** (active → completed/cancelled; available ↔ maintenance ↔ broken).

## Sequence diagram

| File | Purpose |
|------|---------|
| `booking-sequence.drawio` | Create booking — message order: User → Browser → Express → JWT → MySQL |

Description: [`../07-sequence-diagram.md`](../07-sequence-diagram.md).

**Shows:** **who calls whom over time** for one scenario (login + POST booking) — technical view.

## Activity diagram

| File | Purpose |
|------|---------|
| `booking-activity.drawio` | UC-30 algorithm with swimlanes (User | API | MySQL) and decision diamonds |

Description: [`../08-activity-diagram.md`](../08-activity-diagram.md).

**Shows:** **business process flow** with branches (logged in? role OK? equipment available? slot free?).

---

## How to edit & export

1. **File → Open from → Device** → pick a `.drawio` file.
2. Edit labels or layout.
3. **File → Export as → PNG** or **PDF** for your report.

Aligned with [`database/schema.sql`](../../database/schema.sql) and [`../03-tables.md`](../03-tables.md).

## Style

- White boxes, `#333` borders, light gray swimlanes (`#eee` / `#f7f7f7`)
- No sketch/hand-drawn mode — standard UML shapes
- Export: **File → Export as → PNG** or **PDF**

## Visual Paradigm

Optional. Import `.drawio` into VP Online (**Import draw.io**); draw.io export is enough for this project.

## Quick comparison

| Diagram | Question it answers | Time axis? | Best for |
|---------|---------------------|------------|----------|
| **ERD** | What data exists? | No | DB design chapter |
| **CRUD matrix** | Who may change what? | No | Security / roles |
| **Use case** | What can each actor do? | No | Requirements |
| **State** | What statuses exist? | No | Business rules |
| **Sequence** | Which component sends what message? | Yes (messages) | API / implementation |
| **Activity** | What steps and decisions in the process? | Yes (flow) | One use case walkthrough |
