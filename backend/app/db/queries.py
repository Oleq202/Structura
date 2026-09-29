from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from .pool import get_pool

async def _fetch_row(query: str, *args):
    pool = await get_pool()
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *args)
        return dict(row) if row else None

async def _fetch_rows(query: str, *args):
    pool = await get_pool()
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *args)
        return [dict(row) for row in rows]

async def _execute(query: str, *args):
    pool = await get_pool()
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    async with pool.acquire() as conn:
        await conn.execute(query, *args)

async def _execute_many(query: str, args_list: list[tuple]):
    pool = await get_pool()
    if pool is None:
        raise RuntimeError("Database pool not initialized")
    async with pool.acquire() as conn:
        await conn.executemany(query, args_list)

async def init_db_schema():
    """Ensure newly required tables, soft delete columns, audit fields, and performance indexes exist."""
    queries = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;",
        "ALTER TABLE buildings ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;",
        "ALTER TABLE buildings ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;",
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;",
        "ALTER TABLE activity_logs ALTER COLUMN task_id DROP NOT NULL;",
        "ALTER TABLE activity_logs ALTER COLUMN operation_type TYPE VARCHAR(50);",
        "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS changes_json TEXT DEFAULT NULL;",
        "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45) DEFAULT NULL;",
        "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS user_agent TEXT DEFAULT NULL;",
        "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_type VARCHAR(50) DEFAULT 'task';",
        "ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS entity_id INTEGER DEFAULT NULL;",
        """
        CREATE TABLE IF NOT EXISTS user_preferences (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            language VARCHAR(10) NOT NULL DEFAULT 'pl',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        "ALTER TABLE user_preferences ALTER COLUMN language SET DEFAULT 'pl';",
        """
        CREATE TABLE IF NOT EXISTS building_managers (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, building_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS user_selected_buildings (
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
            PRIMARY KEY (user_id, building_id)
        );
        """,
        """
        CREATE TABLE IF NOT EXISTS user_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_hash VARCHAR(255) NOT NULL UNIQUE,
            family_id UUID NOT NULL,
            user_agent TEXT,
            ip_address VARCHAR(45),
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        """,
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);",
        "CREATE INDEX IF NOT EXISTS idx_user_sessions_family_id ON user_sessions(family_id);",
        "CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(status, created_at DESC) WHERE deleted_at IS NULL;",
        "CREATE INDEX IF NOT EXISTS idx_tasks_building_active ON tasks(building_id) WHERE deleted_at IS NULL;",
        "CREATE INDEX IF NOT EXISTS idx_buildings_active ON buildings(city, district) WHERE deleted_at IS NULL AND is_active = TRUE;",
        "CREATE INDEX IF NOT EXISTS idx_users_active ON users(role) WHERE deleted_at IS NULL AND is_active = TRUE;",
        "CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);",
    ]
    for q in queries:
        try:
            await _execute(q)
        except Exception as e:
            print(f"[SCHEMA INIT ERROR] {e} on query: {q}")

async def get_user(user_id: int):
    query = "SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE"
    return await _fetch_row(query, user_id)

async def get_user_by_login(login: str):
    query = "SELECT * FROM users WHERE login = $1 AND deleted_at IS NULL AND is_active = TRUE"
    return await _fetch_row(query, login)

async def get_all_users(limit: int = 100, offset: int = 0, search: Optional[str] = None):
    if search:
        query = """
            SELECT * FROM users
            WHERE deleted_at IS NULL AND is_active = TRUE
              AND (login ILIKE $1 OR first_name ILIKE $1 OR last_name ILIKE $1)
            ORDER BY last_name, first_name
            LIMIT $2 OFFSET $3
        """
        return await _fetch_rows(query, f"%{search}%", limit, offset)

    query = """
        SELECT * FROM users
        WHERE deleted_at IS NULL AND is_active = TRUE
        ORDER BY last_name, first_name
        LIMIT $1 OFFSET $2
    """
    return await _fetch_rows(query, limit, offset)

async def get_contractors():
    query = """
        SELECT * FROM users
        WHERE role = 'contractor' AND deleted_at IS NULL AND is_active = TRUE
        ORDER BY last_name, first_name
    """
    return await _fetch_rows(query)

async def add_user(
    login: str, password: str, first_name: str, last_name: str, role: str
) -> int | None:
    query = """
        INSERT INTO users (login, password_hash, first_name, last_name, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """
    row = await _fetch_row(query, login, password, first_name, last_name, role)
    if row:
        user_id = row["id"]
        await _execute(
            "INSERT INTO user_preferences (user_id, language) VALUES ($1, 'pl') ON CONFLICT (user_id) DO NOTHING",
            user_id,
        )
        return user_id
    return None

async def delete_user(user_id: int):

    query = "UPDATE users SET is_active = FALSE, deleted_at = NOW() WHERE id = $1"
    await _execute(query, user_id)

async def update_user(
    user_id: int,
    login: str,
    password: str | None,
    first_name: str,
    last_name: str,
    role: str,
):
    if password is None:
        query = """
            UPDATE users
            SET login = $2, first_name = $3, last_name = $4, role = $5
            WHERE id = $1 AND deleted_at IS NULL
        """
        await _execute(query, user_id, login, first_name, last_name, role)
        return

    query = """
        UPDATE users
        SET login = $2, password_hash = $3, first_name = $4, last_name = $5, role = $6
        WHERE id = $1 AND deleted_at IS NULL
    """
    await _execute(query, user_id, login, password, first_name, last_name, role)

async def update_user_password(user_id: int, password_hash: str):
    query = """
        UPDATE users
        SET password_hash = $2
        WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE
    """
    await _execute(query, user_id, password_hash)

async def get_building(building_id: int):
    query = "SELECT * FROM buildings WHERE id = $1 AND deleted_at IS NULL AND is_active = TRUE"
    return await _fetch_row(query, building_id)

async def get_building_by_address(city: str, district: str | None, street_address: str):
    query = """
        SELECT * FROM buildings
        WHERE city = $1 AND district IS NOT DISTINCT FROM $2 AND street_address = $3
          AND deleted_at IS NULL AND is_active = TRUE
    """
    return await _fetch_row(query, city, district, street_address)

async def get_all_buildings(limit: int = 100, offset: int = 0, search: Optional[str] = None):
    if search:
        query = """
            SELECT * FROM buildings
            WHERE deleted_at IS NULL AND is_active = TRUE
              AND (city ILIKE $1 OR district ILIKE $1 OR street_address ILIKE $1)
            ORDER BY city, district, street_address
            LIMIT $2 OFFSET $3
        """
        return await _fetch_rows(query, f"%{search}%", limit, offset)

    query = """
        SELECT * FROM buildings
        WHERE deleted_at IS NULL AND is_active = TRUE
        ORDER BY city, district, street_address
        LIMIT $1 OFFSET $2
    """
    return await _fetch_rows(query, limit, offset)

async def get_buildings_by_manager(
    user_id: int,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
):
    if search:
        query = """
            SELECT b.* FROM buildings b
            JOIN building_managers bm ON b.id = bm.building_id
            WHERE bm.user_id = $1 AND b.deleted_at IS NULL AND b.is_active = TRUE
            AND (b.city ILIKE $2 OR b.district ILIKE $2 OR b.street_address ILIKE $2)
            ORDER BY city, district, street_address
            LIMIT $3 OFFSET $4
        """
        return await _fetch_rows(query, user_id, f"%{search}%", limit, offset)

    query = """
        SELECT b.* FROM buildings b
        JOIN building_managers bm ON b.id = bm.building_id
        WHERE bm.user_id = $1 AND b.deleted_at IS NULL AND b.is_active = TRUE
        ORDER BY city, district, street_address
        LIMIT $2 OFFSET $3
    """
    return await _fetch_rows(query, user_id, limit, offset)

async def add_building(city: str, district: str | None, street_address: str) -> int | None:
    query = """
        INSERT INTO buildings (city, district, street_address)
        VALUES ($1, $2, $3)
        RETURNING id
    """
    row = await _fetch_row(query, city, district, street_address)
    return row["id"] if row else None

async def update_building(
    building_id: int, city: str, district: str | None, street_address: str
):
    query = """
        UPDATE buildings
        SET city = $2, district = $3, street_address = $4
        WHERE id = $1 AND deleted_at IS NULL
    """
    await _execute(query, building_id, city, district, street_address)

async def delete_building(building_id: int):

    query = "UPDATE buildings SET is_active = FALSE, deleted_at = NOW() WHERE id = $1"
    await _execute(query, building_id)

async def get_task(task_id: int):
    query = """
        SELECT t.*,
            cb.id as created_by_id, cb.login as created_by_login, cb.first_name as created_by_first_name, cb.last_name as created_by_last_name, cb.role as created_by_role,
            at.id as assigned_to_id, at.login as assigned_to_login, at.first_name as assigned_to_first_name, at.last_name as assigned_to_last_name, at.role as assigned_to_role,
            b.id as building_id, b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM tasks t
        LEFT JOIN users cb ON t.created_by = cb.id
        LEFT JOIN users at ON t.assigned_to = at.id
        LEFT JOIN buildings b ON t.building_id = b.id
        WHERE t.id = $1 AND t.deleted_at IS NULL
    """
    return await _fetch_row(query, task_id)

async def get_all_tasks(
    building_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    manager_id: Optional[int] = None,
    completed_days: Optional[int] = 14,
    limit: int = 100,
    offset: int = 0,
):
    conditions = ["t.deleted_at IS NULL"]
    params = []
    param_idx = 1

    if manager_id is not None:
        conditions.append(f"t.building_id IN (SELECT building_id FROM building_managers WHERE user_id = ${param_idx})")
        params.append(manager_id)
        param_idx += 1

    if building_id is not None:
        conditions.append(f"t.building_id = ${param_idx}")
        params.append(building_id)
        param_idx += 1

    if status is not None:
        conditions.append(f"t.status = ${param_idx}")
        params.append(status)
        param_idx += 1
        if status == "completed" and completed_days is not None and completed_days > 0:
            conditions.append(f"COALESCE(t.updated_at, t.created_at) >= NOW() - (${param_idx}::int * INTERVAL '1 day')")
            params.append(completed_days)
            param_idx += 1
    elif completed_days is not None and completed_days > 0:
        conditions.append(
            f"(t.status = 'pending' OR (t.status = 'completed' AND COALESCE(t.updated_at, t.created_at) >= NOW() - (${param_idx}::int * INTERVAL '1 day')))"
        )
        params.append(completed_days)
        param_idx += 1

    if search is not None:
        conditions.append(f"(t.title ILIKE ${param_idx} OR t.description ILIKE ${param_idx})")
        params.append(f"%{search}%")
        param_idx += 1

    params.extend([limit, offset])

    query = f"""
        SELECT t.*,
            cb.id as created_by_id, cb.login as created_by_login, cb.first_name as created_by_first_name, cb.last_name as created_by_last_name, cb.role as created_by_role,
            at.id as assigned_to_id, at.login as assigned_to_login, at.first_name as assigned_to_first_name, at.last_name as assigned_to_last_name, at.role as assigned_to_role,
            b.id as building_id, b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM tasks t
        LEFT JOIN users cb ON t.created_by = cb.id
        LEFT JOIN users at ON t.assigned_to = at.id
        LEFT JOIN buildings b ON t.building_id = b.id
        WHERE {' AND '.join(conditions)}
        ORDER BY t.created_at DESC
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """
    return await _fetch_rows(query, *params)

async def get_task_by_contractor(
    user_id: int,
    status: Optional[str] = None,
    completed_days: Optional[int] = 14,
    limit: int = 100,
    offset: int = 0,
):
    conditions = ["t.assigned_to = $1", "t.deleted_at IS NULL"]
    params = [user_id]
    param_idx = 2

    if status is not None:
        conditions.append(f"t.status = ${param_idx}")
        params.append(status)
        param_idx += 1
        if status == "completed" and completed_days is not None and completed_days > 0:
            conditions.append(f"COALESCE(t.updated_at, t.created_at) >= NOW() - (${param_idx}::int * INTERVAL '1 day')")
            params.append(completed_days)
            param_idx += 1
    elif completed_days is not None and completed_days > 0:
        conditions.append(
            f"(t.status = 'pending' OR (t.status = 'completed' AND COALESCE(t.updated_at, t.created_at) >= NOW() - (${param_idx}::int * INTERVAL '1 day')))"
        )
        params.append(completed_days)
        param_idx += 1

    params.extend([limit, offset])

    query = f"""
        SELECT t.*,
            cb.id as created_by_id, cb.login as created_by_login, cb.first_name as created_by_first_name, cb.last_name as created_by_last_name, cb.role as created_by_role,
            at.id as assigned_to_id, at.login as assigned_to_login, at.first_name as assigned_to_first_name, at.last_name as assigned_to_last_name, at.role as assigned_to_role,
            b.id as building_id, b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM tasks t
        LEFT JOIN users cb ON t.created_by = cb.id
        LEFT JOIN users at ON t.assigned_to = at.id
        LEFT JOIN buildings b ON t.building_id = b.id
        WHERE {' AND '.join(conditions)}
        ORDER BY t.created_at DESC
        LIMIT ${param_idx} OFFSET ${param_idx + 1}
    """
    return await _fetch_rows(query, *params)

async def get_pending_tasks_by_user(user_id: int, role: str, limit: int = 10):
    if role == "admin":
        query = "SELECT * FROM tasks WHERE status = 'pending' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $1"
        return await _fetch_rows(query, limit)

    query = """
        SELECT t.* FROM tasks t
        JOIN building_managers bm ON t.building_id = bm.building_id
        WHERE bm.user_id = $1 AND t.status = 'pending' AND t.deleted_at IS NULL
        ORDER BY t.created_at DESC LIMIT $2
    """
    return await _fetch_rows(query, user_id, limit)

async def get_completed_tasks_by_user(user_id: int, role: str, limit: int = 10):
    if role == "admin":
        query = "SELECT * FROM tasks WHERE status = 'completed' AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $1"
        return await _fetch_rows(query, limit)

    query = """
        SELECT t.* FROM tasks t
        JOIN building_managers bm ON t.building_id = bm.building_id
        WHERE bm.user_id = $1 AND t.status = 'completed' AND t.deleted_at IS NULL
        ORDER BY t.created_at DESC LIMIT $2
    """
    return await _fetch_rows(query, user_id, limit)

async def add_task(
    title: str,
    description: str | None,
    building_id: int,
    created_by: int,
    assigned_to: int,
) -> int | None:
    query = """
        INSERT INTO tasks (title, description, building_id, created_by, assigned_to)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    """
    row = await _fetch_row(query, title, description, building_id, created_by, assigned_to)
    return row["id"] if row else None

async def update_task(
    task_id: int,
    title: str | None,
    description: str | None,
    building_id: int | None,
    created_by: int | None,
    assigned_to: int | None,
):
    updates = []
    params = [task_id]
    param_index = 2

    if title is not None:
        updates.append(f"title = ${param_index}")
        params.append(title)
        param_index += 1

    if description is not None:
        updates.append(f"description = ${param_index}")
        params.append(description)
        param_index += 1

    if building_id is not None:
        updates.append(f"building_id = ${param_index}")
        params.append(building_id)
        param_index += 1

    if created_by is not None:
        updates.append(f"created_by = ${param_index}")
        params.append(created_by)
        param_index += 1

    if assigned_to is not None:
        updates.append(f"assigned_to = ${param_index}")
        params.append(assigned_to)
        param_index += 1

    if updates:
        query = f"UPDATE tasks SET {', '.join(updates)} WHERE id = $1 AND deleted_at IS NULL"
        await _execute(query, *params)

async def update_task_status(task_id: int, status: str):
    query = "UPDATE tasks SET status = $2 WHERE id = $1 AND deleted_at IS NULL"
    await _execute(query, task_id, status)

async def delete_task(task_id: int):

    query = "UPDATE tasks SET deleted_at = NOW() WHERE id = $1"
    await _execute(query, task_id)

async def get_activity_logs(limit: int = 10):
    query = """
        SELECT al.*,
            u.id as user_id, u.login as user_login, u.first_name as user_first_name, u.last_name as user_last_name, u.role as user_role,
            t.title as task_title, t.status as task_status,
            b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN tasks t ON al.task_id = t.id
        LEFT JOIN buildings b ON t.building_id = b.id
        ORDER BY al.timestamp DESC LIMIT $1
    """
    return await _fetch_rows(query, limit)

async def get_activity_logs_by_task(task_id: int):
    query = """
        SELECT al.*,
            u.id as user_id, u.login as user_login, u.first_name as user_first_name, u.last_name as user_last_name, u.role as user_role,
            t.title as task_title, t.status as task_status,
            b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN tasks t ON al.task_id = t.id
        LEFT JOIN buildings b ON t.building_id = b.id
        WHERE al.task_id = $1 ORDER BY al.timestamp ASC
    """
    return await _fetch_rows(query, task_id)

async def get_activity_logs_filtered(
    user_id: int | None = None,
    entity_type: str | None = None,
    operation_type: str | None = None,
    search: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
    limit: int = 50,
):
    conditions = []
    params = []
    param_index = 1

    if user_id is not None:
        conditions.append(f"al.user_id = ${param_index}")
        params.append(user_id)
        param_index += 1

    if entity_type is not None and str(entity_type).strip():
        conditions.append(f"al.entity_type = ${param_index}")
        params.append(str(entity_type).strip())
        param_index += 1

    if operation_type is not None and str(operation_type).strip():
        conditions.append(f"al.operation_type = ${param_index}")
        params.append(str(operation_type).strip())
        param_index += 1

    if search is not None and str(search).strip():
        search_pattern = f"%{str(search).strip()}%"
        conditions.append(
            f"(al.action ILIKE ${param_index} OR t.title ILIKE ${param_index} OR u.login ILIKE ${param_index} OR u.first_name ILIKE ${param_index} OR u.last_name ILIKE ${param_index})"
        )
        params.append(search_pattern)
        param_index += 1

    if start_date is not None and str(start_date).strip():
        val = str(start_date).strip()
        if len(val) == 10:
            dt = datetime.strptime(val, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        else:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
        conditions.append(f"al.timestamp >= ${param_index}")
        params.append(dt)
        param_index += 1

    if end_date is not None and str(end_date).strip():
        val = str(end_date).strip()
        if len(val) == 10:
            dt = datetime.strptime(val, "%Y-%m-%d").replace(hour=23, minute=59, second=59, microsecond=999999, tzinfo=timezone.utc)
        else:
            dt = datetime.fromisoformat(val.replace("Z", "+00:00"))
        conditions.append(f"al.timestamp <= ${param_index}")
        params.append(dt)
        param_index += 1

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    params.append(limit)

    query = f"""
        SELECT al.id, al.task_id, al.user_id, al.operation_type, al.action, al.changes_json, al.timestamp,
            al.entity_type, al.entity_id, al.ip_address, al.user_agent,
            u.login as user_login, u.first_name as user_first_name, u.last_name as user_last_name, u.role as user_role,
            t.title as task_title, t.status as task_status,
            b.city as building_city, b.district as building_district, b.street_address as building_street_address
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        LEFT JOIN tasks t ON al.task_id = t.id
        LEFT JOIN buildings b ON t.building_id = b.id
        {where_clause}
        ORDER BY al.timestamp DESC LIMIT ${param_index}
    """
    return await _fetch_rows(query, *params)

async def add_activity_log(
    task_id: int | None,
    user_id: int | None,
    operation_type: str,
    action: str,
    changes_json: dict | None = None,
    entity_type: str = "task",
    entity_id: int | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
) -> int | None:
    import json

    query = """
        INSERT INTO activity_logs (task_id, user_id, operation_type, action, changes_json, entity_type, entity_id, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
    """
    changes_json_str = json.dumps(changes_json) if changes_json else None
    row = await _fetch_row(
        query,
        task_id,
        user_id,
        operation_type,
        action,
        changes_json_str,
        entity_type,
        entity_id,
        ip_address,
        user_agent,
    )
    return row["id"] if row else None

async def get_manager_for_building(building_id: int):
    query = """
        SELECT u.* FROM users u
        JOIN building_managers bm ON u.id = bm.user_id
        WHERE bm.building_id = $1 AND u.deleted_at IS NULL AND u.is_active = TRUE
    """
    return await _fetch_row(query, building_id)

async def get_building_for_manager(user_id: int):
    query = """
        SELECT b.* FROM buildings b
        JOIN building_managers bm ON b.id = bm.building_id
        WHERE bm.user_id = $1 AND b.deleted_at IS NULL AND b.is_active = TRUE
    """
    return await _fetch_row(query, user_id)

async def add_building_manager(building_id: int, user_id: int):
    query = "INSERT INTO building_managers (building_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING"
    await _execute(query, building_id, user_id)

async def delete_building_manager(building_id: int, user_id: int):
    query = "DELETE FROM building_managers WHERE building_id = $1 AND user_id = $2"
    await _execute(query, building_id, user_id)

async def get_user_preferences(user_id: int) -> dict:
    """Fetch user language preferences and selected building IDs."""
    pref_row = await _fetch_row(
        "SELECT language FROM user_preferences WHERE user_id = $1", user_id
    )
    language = pref_row["language"] if pref_row else "pl"

    rows = await _fetch_rows(
        """
        SELECT usb.building_id
        FROM user_selected_buildings usb
        JOIN buildings b ON usb.building_id = b.id
        WHERE usb.user_id = $1 AND b.deleted_at IS NULL AND b.is_active = TRUE
        """,
        user_id,
    )
    selected_building_ids = [r["building_id"] for r in rows]

    return {
        "user_id": user_id,
        "language": language,
        "selected_building_ids": selected_building_ids,
    }

async def update_user_preferences(
    user_id: int,
    language: str | None = None,
    selected_building_ids: list[int] | None = None,
) -> dict:
    """Update language preference and sync selected building workspace in an atomic transaction."""
    pool = await get_pool()
    if pool is None:
        raise RuntimeError("Database pool not initialized")

    async with pool.acquire() as conn:
        async with conn.transaction():
            if language is not None:
                await conn.execute(
                    """
                    INSERT INTO user_preferences (user_id, language, updated_at)
                    VALUES ($1, $2, NOW())
                    ON CONFLICT (user_id)
                    DO UPDATE SET language = EXCLUDED.language, updated_at = NOW()
                    """,
                    user_id,
                    language,
                )
            else:
                await conn.execute(
                    """
                    INSERT INTO user_preferences (user_id, language, updated_at)
                    VALUES ($1, 'pl', NOW())
                    ON CONFLICT (user_id) DO NOTHING
                    """,
                    user_id,
                )

            if selected_building_ids is not None:
                await conn.execute(
                    "DELETE FROM user_selected_buildings WHERE user_id = $1", user_id
                )
                if selected_building_ids:
                    args_list = [(user_id, b_id) for b_id in selected_building_ids]
                    await conn.executemany(
                        "INSERT INTO user_selected_buildings (user_id, building_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                        args_list,
                    )

    return await get_user_preferences(user_id)


async def create_user_session(
    user_id: int,
    token_hash: str,
    family_id: Any,
    expires_at: datetime,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
):
    query = """
        INSERT INTO user_sessions (user_id, token_hash, family_id, expires_at, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    """
    return await _fetch_row(
        query, user_id, token_hash, family_id, expires_at, user_agent, ip_address
    )


async def get_user_session(token_hash: str):
    query = """
        SELECT * FROM user_sessions
        WHERE token_hash = $1 AND expires_at > NOW()
    """
    return await _fetch_row(query, token_hash)


async def revoke_user_session(token_hash: str):
    query = """
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE token_hash = $1 AND revoked_at IS NULL
        RETURNING *
    """
    return await _fetch_row(query, token_hash)


async def revoke_session_family(family_id: Any):
    query = """
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE family_id = $1 AND revoked_at IS NULL
    """
    await _execute(query, family_id)


async def revoke_all_user_sessions(user_id: int):
    query = """
        UPDATE user_sessions
        SET revoked_at = NOW()
        WHERE user_id = $1 AND revoked_at IS NULL
    """
    await _execute(query, user_id)


async def cleanup_expired_sessions():
    query = """
        DELETE FROM user_sessions
        WHERE expires_at < NOW() OR (revoked_at IS NOT NULL AND revoked_at < NOW() - INTERVAL '30 days')
    """
    await _execute(query)

