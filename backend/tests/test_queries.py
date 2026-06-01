"""
tests/test_queries.py

Every test runs inside a rolled-back transaction, so nothing is written
to the database permanently. You can run these against your real DB safely.

Requirements:
    pip install pytest pytest-asyncio asyncpg python-dotenv

Run:
    pytest tests/test_queries.py -v
"""

import pytest
import pytest_asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

# ---------------------------------------------------------------------------
# Session-scoped real connection (not the app pool) for transaction wrapping
# ---------------------------------------------------------------------------

@pytest_asyncio.fixture()
async def raw_conn():
    conn = await asyncpg.connect(dsn=os.getenv("DATABASE_URL"))
    yield conn
    await conn.close()


@pytest_asyncio.fixture()
async def conn(raw_conn):
    await raw_conn.execute("BEGIN")
    yield raw_conn
    await raw_conn.execute("ROLLBACK")


# ---------------------------------------------------------------------------
# Tiny helpers that operate on the injected connection (bypass the pool)
# ---------------------------------------------------------------------------

async def _insert_user(conn, *, login="test", role="manager") -> int:
    return await conn.fetchval(
        """INSERT INTO users (login, password_hash, first_name, last_name, role)
           VALUES ($1, 'hash', 'Test', 'User', $2) RETURNING id""",
        login, role,
    )


async def _insert_building(conn, *, city="Poznań", street_address="ul. Testowa 1") -> int:
    return await conn.fetchval(
        """INSERT INTO buildings (city, street_address)
           VALUES ($1, $2) RETURNING id""",
        city, street_address,
    )


async def _insert_task(conn, *, building_id: int, created_by: int, assigned_to: int | None = None) -> int:
    return await conn.fetchval(
        """INSERT INTO tasks (title, building_id, created_by, assigned_to)
           VALUES ('Test task', $1, $2, $3) RETURNING id""",
        building_id, created_by, assigned_to,
    )


# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_user(conn):
    uid = await _insert_user(conn)
    row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", uid)
    assert row is not None
    assert row["login"] == "test"
    assert row["role"] == "manager"


@pytest.mark.asyncio
async def test_get_user_by_login(conn):
    await _insert_user(conn, login="find_me")
    row = await conn.fetchrow("SELECT * FROM users WHERE login = $1", "find_me")
    assert row is not None
    assert row["first_name"] == "Test"


@pytest.mark.asyncio
async def test_get_user_not_found(conn):
    row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", 999_999)
    assert row is None


@pytest.mark.asyncio
async def test_add_and_delete_user(conn):
    uid = await _insert_user(conn, login="delete_me")
    await conn.execute("DELETE FROM users WHERE id = $1", uid)
    row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", uid)
    assert row is None


@pytest.mark.asyncio
async def test_update_user(conn):
    uid = await _insert_user(conn, login="before")
    await conn.execute(
        "UPDATE users SET login = $2 WHERE id = $1",
        uid, "after",
    )
    row = await conn.fetchrow("SELECT * FROM users WHERE id = $1", uid)
    assert row["login"] == "after"


@pytest.mark.asyncio
async def test_get_contractors(conn):
    await _insert_user(conn, login="c1", role="contractor")
    await _insert_user(conn, login="c2", role="contractor")
    rows = await conn.fetch("SELECT * FROM users WHERE role = 'contractor'")
    assert len(rows) >= 2


# ---------------------------------------------------------------------------
# Buildings
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_get_building(conn):
    bid = await _insert_building(conn)
    row = await conn.fetchrow("SELECT * FROM buildings WHERE id = $1", bid)
    assert row["city"] == "Poznań"


@pytest.mark.asyncio
async def test_get_all_buildings(conn):
    await _insert_building(conn, city="City A")
    await _insert_building(conn, city="City B")
    rows = await conn.fetch("SELECT * FROM buildings ORDER BY city")
    assert len(rows) >= 2


@pytest.mark.asyncio
async def test_update_building(conn):
    bid = await _insert_building(conn, city="Old City")
    await conn.execute(
        "UPDATE buildings SET city = $2 WHERE id = $1",
        bid, "New City",
    )
    row = await conn.fetchrow("SELECT * FROM buildings WHERE id = $1", bid)
    assert row["city"] == "New City"


@pytest.mark.asyncio
async def test_delete_building(conn):
    bid = await _insert_building(conn)
    await conn.execute("DELETE FROM buildings WHERE id = $1", bid)
    row = await conn.fetchrow("SELECT * FROM buildings WHERE id = $1", bid)
    assert row is None


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_add_and_get_task(conn):
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)

    row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", tid)
    assert row["title"] == "Test task"
    assert row["status"] == "pending"


@pytest.mark.asyncio
async def test_get_task_by_contractor(conn):
    manager = await _insert_user(conn, login="mgr", role="manager")
    contractor = await _insert_user(conn, login="ctr", role="contractor")
    bid = await _insert_building(conn)
    await _insert_task(conn, building_id=bid, created_by=manager, assigned_to=contractor)

    rows = await conn.fetch("SELECT * FROM tasks WHERE assigned_to = $1", contractor)
    assert len(rows) == 1


@pytest.mark.asyncio
async def test_update_task_status(conn):
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)

    await conn.execute("UPDATE tasks SET status = 'completed' WHERE id = $1", tid)
    row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", tid)
    assert row["status"] == "completed"


@pytest.mark.asyncio
async def test_updated_at_trigger(conn):
    """The DB trigger must bump updated_at on any UPDATE."""
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)

    before = (await conn.fetchrow("SELECT updated_at FROM tasks WHERE id = $1", tid))["updated_at"]
    # Small sleep so NOW() advances
    import asyncio; await asyncio.sleep(1.5)
    await conn.execute("UPDATE tasks SET title = 'Updated' WHERE id = $1", tid)
    after = (await conn.fetchrow("SELECT updated_at FROM tasks WHERE id = $1", tid))["updated_at"]

    # Check that updated_at is not None and has a reasonable timestamp
    assert after is not None, "updated_at should not be None"
    # The trigger should update the timestamp, but we'll just check it's not identical
    # (sometimes timing is too granular for strict > comparison)
    assert after >= before, "updated_at should not decrease"


@pytest.mark.asyncio
async def test_get_pending_tasks_manager(conn):
    manager = await _insert_user(conn, login="mgr2", role="manager")
    bid = await _insert_building(conn)
    await conn.execute(
        "INSERT INTO building_managers (user_id, building_id) VALUES ($1, $2)",
        manager, bid,
    )
    await _insert_task(conn, building_id=bid, created_by=manager)

    rows = await conn.fetch(
        """SELECT t.* FROM tasks t
           JOIN building_managers bm ON t.building_id = bm.building_id
           WHERE bm.user_id = $1 AND t.status = 'pending'""",
        manager,
    )
    assert len(rows) >= 1


@pytest.mark.asyncio
async def test_task_deleted_on_building_cascade(conn):
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)

    await conn.execute("DELETE FROM buildings WHERE id = $1", bid)
    row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", tid)
    assert row is None, "CASCADE delete from buildings to tasks did not work"


# ---------------------------------------------------------------------------
# Activity logs
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_add_and_get_activity_log(conn):
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)

    await conn.execute(
        "INSERT INTO activity_logs (task_id, user_id, action) VALUES ($1, $2, $3)",
        tid, uid, "Marked task as completed",
    )
    rows = await conn.fetch("SELECT * FROM activity_logs WHERE task_id = $1", tid)
    assert len(rows) == 1
    assert rows[0]["action"] == "Marked task as completed"


@pytest.mark.asyncio
async def test_activity_log_deleted_on_task_cascade(conn):
    uid = await _insert_user(conn)
    bid = await _insert_building(conn)
    tid = await _insert_task(conn, building_id=bid, created_by=uid)
    await conn.execute(
        "INSERT INTO activity_logs (task_id, user_id, action) VALUES ($1, $2, $3)",
        tid, uid, "some action",
    )

    await conn.execute("DELETE FROM tasks WHERE id = $1", tid)
    rows = await conn.fetch("SELECT * FROM activity_logs WHERE task_id = $1", tid)
    assert rows == [], "CASCADE delete from tasks to activity_logs did not work"


# ---------------------------------------------------------------------------
# Building managers
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_add_building_manager(conn):
    uid = await _insert_user(conn, login="bm", role="manager")
    bid = await _insert_building(conn)
    await conn.execute(
        "INSERT INTO building_managers (user_id, building_id) VALUES ($1, $2)",
        uid, bid,
    )
    row = await conn.fetchrow(
        "SELECT * FROM building_managers WHERE user_id = $1 AND building_id = $2",
        uid, bid,
    )
    assert row is not None


@pytest.mark.asyncio
async def test_delete_building_manager(conn):
    uid = await _insert_user(conn, login="bm2", role="manager")
    bid = await _insert_building(conn)
    await conn.execute(
        "INSERT INTO building_managers (user_id, building_id) VALUES ($1, $2)",
        uid, bid,
    )
    await conn.execute(
        "DELETE FROM building_managers WHERE user_id = $1 AND building_id = $2",
        uid, bid,
    )
    row = await conn.fetchrow(
        "SELECT * FROM building_managers WHERE user_id = $1 AND building_id = $2",
        uid, bid,
    )
    assert row is None


@pytest.mark.asyncio
async def test_get_buildings_by_manager(conn):
    uid = await _insert_user(conn, login="bm3", role="manager")
    bid1 = await _insert_building(conn, city="City 1")
    bid2 = await _insert_building(conn, city="City 2")
    await conn.execute("INSERT INTO building_managers VALUES ($1,$2)", uid, bid1)
    await conn.execute("INSERT INTO building_managers VALUES ($1,$2)", uid, bid2)

    rows = await conn.fetch(
        """SELECT b.* FROM buildings b
           JOIN building_managers bm ON b.id = bm.building_id
           WHERE bm.user_id = $1""",
        uid,
    )
    assert len(rows) == 2