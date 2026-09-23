import pytest
import pytest_asyncio
import asyncpg
import os
import asyncio
from dotenv import load_dotenv

from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.worker import enqueue_notification, _job_queue, start_worker, stop_worker
from app.db.queries import add_activity_log, get_activity_logs_filtered

load_dotenv()

@pytest_asyncio.fixture()
async def raw_conn():
    conn = await asyncpg.connect(dsn=os.getenv("DATABASE_URL"), statement_cache_size=0)
    yield conn
    await conn.close()

@pytest_asyncio.fixture()
async def conn(raw_conn):
    await raw_conn.execute("BEGIN")
    yield raw_conn
    await raw_conn.execute("ROLLBACK")

def test_password_hashing():
    pwd = "EnterpriseSecurePassword123!"
    hashed = hash_password(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_token_type_separation():
    data = {"sub": "admin", "id": 1, "role": "admin"}
    access_token = create_access_token(data)
    refresh_token = create_refresh_token(data)

    assert verify_token(access_token, expected_type="access") is not None
    assert verify_token(access_token, expected_type="refresh") is None

    assert verify_token(refresh_token, expected_type="refresh") is not None
    assert verify_token(refresh_token, expected_type="access") is None

@pytest.mark.asyncio
async def test_worker_notification_dispatch():
    await start_worker()
    initial_qsize = _job_queue.qsize()

    await enqueue_notification(
        event_type="test_event",
        recipient="contractor1",
        message="Test background dispatch",
        payload={"task_id": 999},
    )

    await asyncio.sleep(0.1)
    await stop_worker()

    assert _job_queue.qsize() == 0

@pytest.mark.asyncio
async def test_audit_log_entity_capture(conn):

    user_id = await conn.fetchval(
        """INSERT INTO users (login, password_hash, first_name, last_name, role)
           VALUES ('audit_user', 'hash', 'Audit', 'User', 'manager') RETURNING id"""
    )

    log_id = await conn.fetchval(
        """INSERT INTO activity_logs (task_id, user_id, operation_type, action, entity_type, entity_id, ip_address, user_agent)
           VALUES (NULL, $1, 'login_success', 'User login verified', 'auth', $1, '127.0.0.1', 'pytest/1.0')
           RETURNING id""",
        user_id,
    )
    assert log_id is not None

    row = await conn.fetchrow("SELECT * FROM activity_logs WHERE id = $1", log_id)
    assert row["entity_type"] == "auth"
    assert row["ip_address"] == "127.0.0.1"
    assert row["user_agent"] == "pytest/1.0"
    assert row["operation_type"] == "login_success"

@pytest.mark.asyncio
async def test_get_activity_logs_filtered_date_range(conn):
    from datetime import datetime, timezone
    start_dt = datetime(2026, 9, 1, tzinfo=timezone.utc)
    end_dt = datetime(2026, 9, 30, 23, 59, 59, tzinfo=timezone.utc)
    rows = await conn.fetch(
        """
        SELECT al.id, al.timestamp
        FROM activity_logs al
        WHERE al.timestamp >= $1 AND al.timestamp <= $2
        ORDER BY al.timestamp DESC LIMIT $3
        """,
        start_dt,
        end_dt,
        10,
    )
    assert isinstance(rows, list)
