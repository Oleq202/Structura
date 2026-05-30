# Structura — Database Documentation

This document outlines the complete database architecture for **Structura**, a modern Field Service Management (FSM) and Property Maintenance platform. The architecture is designed for a **PostgreSQL** backend (e.g., Neon or Supabase) integrated with a **FastAPI** backend and a **React** frontend.

---

## Architectural Principles

1. **Unified Registries Over Silos:** Instead of creating separate task tables per contractor, all tasks reside within a single, highly indexed table. Contractors are isolated cleanly via software logic (FastAPI endpoint filtering using JWT scope checks).
2. **Normalized Geolocation:** Spatial properties are split into distinct relational attributes (`city`, `district`, `street_address`) to permit clean reporting, filtering, and regional tracking.
3. **Immutability of History:** System activity is tracked via a dedicated append-only log table to ensure the global administrator has complete operational transparency over task lifecycles.

---

## Entity-Relationship Diagram (Conceptual Layout)

```
  ┌────────────────┐               ┌────────────────┐
  │   BUILDINGS    │               │  ACTIVITY_LOGS │
  ├────────────────┤               ├────────────────┤
  │ id (PK)        │◄──────┐       │ id (PK)        │
  │ name           │       │       │ task_id (FK)   │◄────┐
  │ city           │       │       │ user_id (FK)   │     │
  │ district       │       │       │ action         │     │
  │ street_address │       │       │ timestamp      │     │
  └────────────────┘       │       └────────────────┘     │
                           │                              │
                           │ links via                    │ tracks
                           │ building_id                  │ changes
                           │                              │
  ┌────────────────┐       │       ┌────────────────┐     │
  │     USERS      │       └───────┤     TASKS      │     │
  ├────────────────┤               ├────────────────┤     │
  │ id (PK)        │◄─────────────►│ id (PK)        │─────┘
  │ email          │   links via   │ title          │
  │ password_hash  │  created_by / │ description    │
  │ first_name     │  assigned_to  │ status         │
  │ last_name      │               │ building_id    │
  │ role (ENUM)    │               │ created_by     │
  └────────────────┘               │ assigned_to    │
                                   │ created_at     │
                                   │ updated_at     │
                                   └────────────────┘
```

---

## Table Schemas & Definitions

### 1. `users`
Tracks system actors, credentials, and access roles.

| Column Name | Data Type | Constraints | Example / Notes |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | `101` |
| `email` | `VARCHAR(255)` | Unique, Not Null | `oleg@example.com` |
| `password_hash` | `VARCHAR(255)` | Not Null | *Bcrypt / Argon2 Hash* |
| `first_name` | `VARCHAR(100)` | Not Null | `Aleksander` |
| `last_name` | `VARCHAR(100)` | Not Null | `Widman` |
| `role` | `VARCHAR(50)` | Not Null | `admin`, `manager`, `contractor` |

### 2. `buildings`
Defines the physical structures where maintenance tasks take place.

| Column Name | Data Type | Constraints | Example / Notes |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | `1` |
| `name` | `VARCHAR(255)` | Not Null | `Kamienica - Centrum` |
| `city` | `VARCHAR(100)` | Not Null | `Poznań` |
| `district` | `VARCHAR(100)` | Nullable | `Wilda` / `Jeżyce` |
| `street_address` | `VARCHAR(255)` | Not Null | `ul. Półwiejska 42` (Street & building/flat number only) |

### 3. `tasks`
The operational engine of the app mapping what work is requested, where, and who is executing it.

| Column Name | Data Type | Constraints | Example / Notes |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | `5001` |
| `title` | `VARCHAR(255)` | Not Null | `Naprawa bramy wjazdowej` |
| `description` | `TEXT` | Nullable | `Brama nie domyka się automatycznie, fotokomórka zablokowana.` |
| `status` | `VARCHAR(50)` | Not Null, Default: `'pending'` | `pending`, `in_progress`, `completed` |
| `building_id` | `INTEGER` | Foreign Key (`buildings.id`), Not Null | Links to specific property |
| `created_by` | `INTEGER` | Foreign Key (`users.id`), Not Null | ID of the Building Administrator (manager) |
| `assigned_to` | `INTEGER` | Foreign Key (`users.id`), Nullable | ID of the assigned Contractor |
| `created_at` | `TIMESTAMP` | Not Null, Default: `NOW()` | Audit creation time |
| `updated_at` | `TIMESTAMP` | Not Null, Default: `NOW()` | Last state change timestamp |

### 4. `activity_logs`
An immutable ledger capturing operational workflows for the Master Admin view.

| Column Name | Data Type | Constraints | Example / Notes |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | Primary Key, Auto-Increment | `90001` |
| `task_id` | `INTEGER` | Foreign Key (`tasks.id`), Cascade Delete | Target task identifier |
| `user_id` | `INTEGER` | Foreign Key (`users.id`), Set Null | The actor performing the action (e.g., Contractor) |
| `action` | `VARCHAR(255)` | Not Null | `Started task`, `Marked task as completed` |
| `timestamp` | `TIMESTAMP` | Not Null, Default: `NOW()` | Exact moment execution happened |

---

## Query Optimization & indexing Strategies

To guarantee rapid performance on mobile applications over limited data connections, ensure the following indexes are compiled within PostgreSQL:

* **Task Assignments:** Index on `tasks(assigned_to)` ensures that the contractor's home feed renders immediately without full table scans.
* **Geographical Filtering:** Composite index on `buildings(city, district)` for instant administrative telemetry lookups.
* **Activity Tracking:** Index on `activity_logs(task_id)` to speed up structural audit-trail popups inside the administrator workspace.
