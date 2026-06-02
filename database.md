# Database Documentation — Structura

This document outlines the complete relational database schema for **Structura**, a modern Field Service Management (FSM) and Property Maintenance platform.

The schema is built for a **PostgreSQL** instance (e.g., Neon, Supabase) and integrates directly with a **FastAPI** backend using an ORM like SQLAlchemy or SQLModel.

---

## 🏗️ Architectural Core Principles

1. **Role-Based Security & Data Isolation:** System access is restricted via database-level `ENUM` scopes (`admin`, `manager`, `contractor`). Data separation is handled through relational mapping rather than table duplication.
2. **Unified Task Registry:** All work orders live inside a single, highly indexed `tasks` table. This provides the global Admin with a complete bird's-eye view while keeping contractor queries efficient.
3. **Many-to-Many Manager Mapping:** Managers (Building Administrators) are linked to physical locations via a junction table (`building_managers`). This allows a single manager to oversee multiple properties dynamically while restricting their read/write permissions strictly to those locations.
4. **Normalized Geography:** Physical locations are explicitly broken into `city`, `district`, and `street_address` columns to ensure rapid, index-driven regional filtering and administrative reporting.

---

## 🗺️ Entity-Relationship Diagram (ERD)

```
                       ┌───────────────────────┐
                       │   building_managers   │
                       ├───────────────────────┤
                       │ user_id (PK, FK)      │
                       │ building_id (PK, FK)  │
                       └───────────┬───────────┘
                                   │
             ┌─────────────────────┴─────────────────────┐
             │                                           │
             ▼                                           ▼
┌───────────────────────┐                   ┌───────────────────────┐
│         users         │                   │       buildings       │
├───────────────────────┤                   ├───────────────────────┤
│ id (PK)               │                   │ id (PK)               │
│ login (Unique)        │                   │ city                  │
│ password_hash         │◄────────┐         │ district              │
│ first_name            │         │         │ street_address        │
│ last_name             │         │         │ created_at            │
│ role (ENUM)           │         │         └───────────▲───────────┘
│ created_at            │         │                     │
└──────────▲────────────┘         │                     │
           │                      │                     │
           │ links via            │ links via           │ links via
           │ created_by /         │ user_id             │ building_id
           │ assigned_to          │                     │
           │                      │                     │
┌──────────┴────────────┐         │         ┌───────────┴───────────┐
│         tasks         │         └─────────┤     activity_logs     │
├───────────────────────┤                   ├───────────────────────┤
│ id (PK)               │                   │ id (PK)               │
│ title                 │◄──────────────────┤ task_id (FK)          │
│ description           │    tracks state   │ user_id (FK)          │
│ status (ENUM)         │    changes        │ action                │
│ building_id (FK)      │                   │ timestamp             │
│ created_by (FK)       │                   └───────────────────────┘
│ assigned_to (FK)      │
│ created_at            │
│ updated_at (Trigger)  │
└───────────────────────┘
```

---

## 🗂️ Data Types & Custom Types

### Custom Enums

```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'contractor');
CREATE TYPE task_status AS ENUM ('pending', 'completed');
```

---

## 📊 Table Schemas & Fields

### 1. `users`

Maintains records for credentials, profile data, and administrative clear levels.

| Column Name     | Data Type      | Constraints          | Default          | Notes / Examples                 |
| :-------------- | :------------- | :------------------- | :--------------- | :------------------------------- |
| `id`            | `SERIAL`       | `PRIMARY KEY`        | _Auto-Increment_ | Unique global user ID            |
| `login`         | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` |                  | Used for logging in              |
| `password_hash` | `VARCHAR(255)` | `NOT NULL`           |                  | Hashed credential string         |
| `first_name`    | `VARCHAR(100)` | `NOT NULL`           |                  | `Aleksander`                     |
| `last_name`     | `VARCHAR(100)` | `NOT NULL`           |                  | `Widman`                         |
| `role`          | `user_role`    | `NOT NULL`           |                  | `admin`, `manager`, `contractor` |
| `created_at`    | `TIMESTAMP TZ` | `NOT NULL`           | `NOW()`          | Timestamp with time zone         |

### 2. `buildings`

Stores details about properties monitored by the system.

| Column Name      | Data Type      | Constraints   | Default          | Notes / Examples                  |
| :--------------- | :------------- | :------------ | :--------------- | :-------------------------------- |
| `id`             | `SERIAL`       | `PRIMARY KEY` | _Auto-Increment_ | Unique building ID                |
| `city`           | `VARCHAR(100)` | `NOT NULL`    |                  | `Poznań`                          |
| `district`       | `VARCHAR(100)` | `NULLABLE`    |                  | `Wilda`                           |
| `street_address` | `VARCHAR(255)` | `NOT NULL`    |                  | Street & building number only     |
| `created_at`     | `TIMESTAMP TZ` | `NOT NULL`    | `NOW()`          | Structural tracking creation date |

### 3. `tasks`

The operational registry holding work orders generated by managers and updated by contractors.

| Column Name   | Data Type      | Constraints                            | Default          | Notes / Examples               |
| :------------ | :------------- | :------------------------------------- | :--------------- | :----------------------------- |
| `id`          | `SERIAL`       | `PRIMARY KEY`                          | _Auto-Increment_ | Unique task ticket ID          |
| `title`       | `VARCHAR(255)` | `NOT NULL`                             |                  | Short summary of issue         |
| `description` | `TEXT`         | `NULLABLE`                             |                  | Expanded context / details     |
| `status`      | `task_status`  | `NOT NULL`                             | `'pending'`      | `pending`, `completed`         |
| `building_id` | `INTEGER`      | `NOT NULL`, `REFERENCES buildings(id)` |                  | **ON DELETE CASCADE**          |
| `created_by`  | `INTEGER`      | `NOT NULL`, `REFERENCES users(id)`     |                  | ID of manager who issued task  |
| `assigned_to` | `INTEGER`      | `REFERENCES users(id)`                 |                  | **ON DELETE SET NULL**         |
| `created_at`  | `TIMESTAMP TZ` | `NOT NULL`                             | `NOW()`          | Operational ticket launch time |
| `updated_at`  | `TIMESTAMP TZ` | `NOT NULL`                             | `NOW()`          | Kept accurate via DB Trigger   |

### 4. `activity_logs`

An audit ledger capturing precise events for administrative review.

| Column Name | Data Type      | Constraints                        | Default          | Notes / Examples                   |
| :---------- | :------------- | :--------------------------------- | :--------------- | :--------------------------------- |
| `id`        | `SERIAL`       | `PRIMARY KEY`                      | _Auto-Increment_ | Unique log track ID                |
| `task_id`   | `INTEGER`      | `NOT NULL`, `REFERENCES tasks(id)` |                  | **ON DELETE CASCADE**              |
| `user_id`   | `INTEGER`      | `REFERENCES users(id)`             |                  | **ON DELETE SET NULL** (The actor) |
| `action`    | `VARCHAR(255)` | `NOT NULL`                         |                  | e.g., `Marked task as completed`   |
| `timestamp` | `TIMESTAMP TZ` | `NOT NULL`                         | `NOW()`          | Event timestamp                    |

### 5. `building_managers`

A composite key junction table modeling the relationship between properties and managers.

| Column Name   | Data Type | Constraints                               | Notes / Examples      |
| :------------ | :-------- | :---------------------------------------- | :-------------------- |
| `user_id`     | `INTEGER` | `PRIMARY KEY`, `REFERENCES users(id)`     | **ON DELETE CASCADE** |
| `building_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES buildings(id)` | **ON DELETE CASCADE** |

---

## ⚡ Performance Optimization (Indexes)

To ensure rapid response times when accessing data over mobile networks, the following indexes are defined:

- **`idx_tasks_assigned_to`**: Optimizes the Contractor's workflow dashboard. Prevents full table scans when a contractor requests their current tasks list.
- **`idx_buildings_city_district`**: A composite index optimized for administrative analytics and geographic sorting across fields.
- **`idx_activity_logs_task_id`**: Accelerates loading detailed task histories and timelines inside the management portal.
- **`idx_building_managers_user`**: Speeds up system access queries immediately after a building manager logs in, ensuring safe scoped routing.

---

## ⚙️ Automated Triggers

The schema uses an internal PostgreSQL trigger function to automate timestamp records:

- **`update_task_modtime`**: Executes `BEFORE UPDATE` on the `tasks` table. It automatically adjusts `updated_at = NOW()` whenever any attribute (such as a status modification) changes. This eliminates manual timestamp definitions on the FastAPI application layer.
