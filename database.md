# Database Documentation — Structura

This document outlines the complete relational database architecture and schema for **Structura**, an Enterprise Field Service Management (FSM) and Property Maintenance platform.

The schema is built for a **PostgreSQL** instance (e.g., local PostgreSQL, Supabase, Neon) and is managed directly via asynchronous queries using [asyncpg](https://github.com/MagicStack/asyncpg) and FastAPI.

---

## 🏗️ Architectural Core Principles

1. **Role-Based Security & Data Isolation:** System access is restricted via database-level `ENUM` scopes (`admin`, `manager`, `contractor`):
   - **Admin**: Full administrative permissions across all entities (Users, Buildings, Tasks) and exclusive access to the system `activity_logs` audit trail.
   - **Manager**: Visibility across all buildings; can create, edit, prioritize, and dispatch tasks for any building and assign them to contractors. Managers cannot view activity logs or manage users/buildings.
   - **Contractor**: Field technicians with scoped visibility limited strictly to tasks assigned to their account, with permissions to update task completion status.
2. **Unified Task & Work Order Registry:** All maintenance requests live inside a single, indexed `tasks` table with foreign key references to buildings, creators, and assigned contractors.
3. **Many-to-Many Manager-to-Building Mapping:** Managers can be linked to physical locations via a junction table (`building_managers`) for organizational mapping.
4. **Active Workspace Filtering:** The `user_selected_buildings` table stores the user's active workspace building filter selections across sessions.
5. **Session Security & Refresh Token Rotation:** The `user_sessions` table tracks refresh token families (`family_id`, `token_hash`, `revoked_at`, `expires_at`) to enable secure token rotation and replay detection.
6. **Soft Deletion & Data Retention:** Entities (`users`, `buildings`, `tasks`) support soft deletion via `deleted_at` timestamps and `is_active` flags, maintaining historical integrity for audit trails.
7. **Comprehensive Event & Audit Logging (Admin Exclusive):** The `activity_logs` ledger captures granular operational events, entity types, IP addresses, user agents, and JSON changes.

---

## 🗺️ Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────┐
│        user_preferences         │
├─────────────────────────────────┤
│ user_id (PK, FK -> users.id)    │
│ language                        │
│ created_at, updated_at          │
└────────────────┬────────────────┘
                 │
                 ▼
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│              users              │           │            buildings            │
├─────────────────────────────────┤           ├─────────────────────────────────┤
│ id (PK)                         │           │ id (PK)                         │
│ login (Unique)                  │           │ city                            │
│ password_hash                   │           │ district                        │
│ first_name, last_name           │           │ street_address                  │
│ role (ENUM: admin/mgr/contract) │           │ is_active (BOOLEAN)             │
│ is_active (BOOLEAN)             │           │ created_at (TIMESTAMPTZ)        │
│ created_at (TIMESTAMPTZ)        │           │ deleted_at (TIMESTAMPTZ)        │
│ deleted_at (TIMESTAMPTZ)        │           └────────────────▲────────────────┘
└───────┬──────────┬──────────▲───┘                            │
        │          │          │                                │
        │          │          ├───────────────────────┐        │
        │          │          │   building_managers   │        │
        │          │          ├───────────────────────┤        │
        │          │          │ user_id (PK, FK)      ├────────┼────────┐
        │          │          │ building_id (PK, FK)  ├────────┘        │
        │          │          └───────────────────────┘                 │
        │          │                                                    │
        │          │          ┌──────────────────────────────┐          │
        │          │          │   user_selected_buildings    │          │
        │          │          ├──────────────────────────────┤          │
        │          │          │ user_id (PK, FK)             │          │
        │          │          │ building_id (PK, FK) ────────┼──────────┤
        │          │          └──────────────────────────────┘          │
        │          │                                                    │
        │          ▼                                                    │
        │ ┌─────────────────────────────────┐                           │
        │ │          user_sessions          │                           │
        │ ├─────────────────────────────────┤                           │
        │ │ id (PK)                         │                           │
        │ │ user_id (FK -> users.id)        │                           │
        │ │ token_hash (Unique)             │                           │
        │ │ family_id (UUID)                │                           │
        │ │ user_agent, ip_address          │                           │
        │ │ expires_at, revoked_at          │                           │
        │ │ created_at                      │                           │
        │ └─────────────────────────────────┘                           │
        │                                                               │
        │ creates (created_by) / assigns (assigned_to)                  │
        ▼                                                               ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                                     tasks                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                       │
│ title, description                                                            │
│ status (ENUM: pending, completed)                                             │
│ building_id (FK -> buildings.id)                                              │
│ created_by (FK -> users.id)                                                   │
│ assigned_to (FK -> users.id, Nullable)                                        │
│ created_at, updated_at (Auto Trigger), deleted_at                             │
└───────────────────────────────────────┬───────────────────────────────────────┘
                                        │
                                        │ references task_id (Nullable)
                                        ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                           activity_logs (Admin Only)                          │
├───────────────────────────────────────────────────────────────────────────────┤
│ id (PK)                                                                       │
│ task_id (FK -> tasks.id, Nullable)                                            │
│ user_id (FK -> users.id, Nullable)                                            │
│ operation_type (VARCHAR: create, update, delete, status_change)               │
│ action (VARCHAR)                                                              │
│ changes_json (JSONB / TEXT)                                                   │
│ entity_type (VARCHAR, e.g. 'task', 'building', 'user')                        │
│ entity_id (INTEGER)                                                           │
│ ip_address, user_agent                                                        │
│ timestamp (TIMESTAMPTZ)                                                       │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Custom Types & ENUMs

Defined in `backend/app/db/schema.sql`:

```sql
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'contractor');
CREATE TYPE task_status AS ENUM ('pending', 'completed');
CREATE TYPE operation_type AS ENUM ('create', 'update', 'delete', 'status_change');
```

---

## 📊 Table Schemas & Fields

### 1. `users`
Maintains credentials, user profile information, role-based clearance, and active status.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | _Auto-Increment_ | Unique internal user ID |
| `login` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | | Username used for authentication |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | | Salted bcrypt password hash |
| `first_name` | `VARCHAR(100)` | `NOT NULL` | | User's first name |
| `last_name` | `VARCHAR(100)` | `NOT NULL` | | User's last name |
| `role` | `user_role` | `NOT NULL` | | ENUM: `admin`, `manager`, `contractor` |
| `is_active` | `BOOLEAN` | `NOT NULL` | `TRUE` | Account active status |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Account creation timestamp |
| `deleted_at` | `TIMESTAMP WITH TIME ZONE` | `NULLABLE` | `NULL` | Soft delete timestamp |

---

### 2. `buildings`
Stores physical properties managed within the system.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | _Auto-Increment_ | Unique building ID |
| `city` | `VARCHAR(100)` | `NOT NULL` | | City (e.g. `Poznań`) |
| `district` | `VARCHAR(100)` | `NULLABLE` | | District/Neighborhood (e.g. `Jeżyce`, `Wilda`) |
| `street_address` | `VARCHAR(255)` | `NOT NULL` | | Street name & building number |
| `is_active` | `BOOLEAN` | `NOT NULL` | `TRUE` | Building operational status |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Registration timestamp |
| `deleted_at` | `TIMESTAMP WITH TIME ZONE` | `NULLABLE` | `NULL` | Soft delete timestamp |

---

### 3. `tasks`
Work orders issued for specific buildings, assigned to contractors, and tracked through completion.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | _Auto-Increment_ | Unique task ID |
| `title` | `VARCHAR(255)` | `NOT NULL` | | Summary title of the maintenance order |
| `description` | `TEXT` | `NULLABLE` | | Detailed explanation of the work required |
| `status` | `task_status` | `NOT NULL` | `'pending'` | ENUM: `pending`, `completed` |
| `building_id` | `INTEGER` | `NOT NULL`, `REFERENCES buildings(id) ON DELETE CASCADE` | | Target building location |
| `created_by` | `INTEGER` | `NOT NULL`, `REFERENCES users(id)` | | User who created the task |
| `assigned_to` | `INTEGER` | `NULLABLE`, `REFERENCES users(id) ON DELETE SET NULL` | | Contractor assigned to the task |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Maintained via `update_task_modtime` trigger |
| `deleted_at` | `TIMESTAMP WITH TIME ZONE` | `NULLABLE` | `NULL` | Soft delete timestamp |

---

### 4. `activity_logs`
Audit ledger capturing system operations, entity updates, and user activities (accessible exclusively to Admins).

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | _Auto-Increment_ | Unique log ID |
| `task_id` | `INTEGER` | `NULLABLE`, `REFERENCES tasks(id) ON DELETE CASCADE` | | Associated task ID (if applicable) |
| `user_id` | `INTEGER` | `NULLABLE`, `REFERENCES users(id) ON DELETE SET NULL` | | User ID who performed the action |
| `operation_type` | `VARCHAR(50)` | `NOT NULL` | `'update'` | Action category (`create`, `update`, `delete`, `status_change`) |
| `action` | `VARCHAR(255)` | `NOT NULL` | | Human-readable action description |
| `changes_json` | `JSONB` / `TEXT` | `NULLABLE` | | JSON payload of before/after state diffs |
| `entity_type` | `VARCHAR(50)` | `NULLABLE` | `'task'` | Entity type (`task`, `building`, `user`, etc.) |
| `entity_id` | `INTEGER` | `NULLABLE` | | ID of target entity |
| `ip_address` | `VARCHAR(45)` | `NULLABLE` | | Client IP address |
| `user_agent` | `TEXT` | `NULLABLE` | | Client User-Agent string |
| `timestamp` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Event timestamp |

---

### 5. `building_managers`
Junction table managing the many-to-many relationship between property managers and buildings.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES users(id) ON DELETE CASCADE` | Manager's user ID |
| `building_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES buildings(id) ON DELETE CASCADE` | Building ID |

---

### 6. `user_preferences`
Persists user-level settings (e.g. language preferences).

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `user_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES users(id) ON DELETE CASCADE` | | Associated user ID |
| `language` | `VARCHAR(10)` | `NOT NULL` | `'pl'` | Preferred UI language code (`pl`, `en`) |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Setting creation timestamp |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Setting last updated timestamp |

---

### 7. `user_selected_buildings`
Tracks the persistent set of buildings a manager or admin has selected in their workspace filter.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES users(id) ON DELETE CASCADE` | User ID |
| `building_id` | `INTEGER` | `PRIMARY KEY`, `REFERENCES buildings(id) ON DELETE CASCADE` | Filtered building ID |

---

### 8. `user_sessions`
Manages authenticated refresh token sessions with token family tracking for replay attack prevention.

| Column Name | Data Type | Constraints | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | _Auto-Increment_ | Session ID |
| `user_id` | `INTEGER` | `NOT NULL`, `REFERENCES users(id) ON DELETE CASCADE` | | Associated user ID |
| `token_hash` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | | SHA-256 hash of refresh token |
| `family_id` | `UUID` | `NOT NULL` | | Token family UUID for rotation tracking |
| `user_agent` | `TEXT` | `NULLABLE` | | Client browser/device user agent |
| `ip_address` | `VARCHAR(45)` | `NULLABLE` | | Client IP address |
| `expires_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | | Refresh token expiration |
| `revoked_at` | `TIMESTAMP WITH TIME ZONE` | `NULLABLE` | `NULL` | Revocation timestamp if rotated/invalidated |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | `NOT NULL` | `NOW()` | Session creation timestamp |

---

## ⚡ Performance Optimization & Indexes

The database defines both standard B-tree indexes and partial indexes to maintain fast queries across large datasets:

```sql
-- Foreign Key & Query Lookup Indexes
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_buildings_city_district ON buildings(city, district);
CREATE INDEX idx_activity_logs_task_id ON activity_logs(task_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- Session Lookup Indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token_hash ON user_sessions(token_hash);
CREATE INDEX idx_user_sessions_family_id ON user_sessions(family_id);

-- Filtered / Partial Indexes (Soft Deletes)
CREATE INDEX idx_tasks_active ON tasks(status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_building_active ON tasks(building_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_buildings_active ON buildings(city, district) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_users_active ON users(role) WHERE deleted_at IS NULL AND is_active = TRUE;
```

---

## ⚙️ Automated Triggers

- **`update_task_modtime`**: Executes `BEFORE UPDATE` on `tasks` to automatically maintain accurate `updated_at = NOW()` records whenever task status or details are updated.

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_task_modtime
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
```
