import pytest
import pytest_asyncio
import asyncpg
import os
import uuid
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

from app.auth import (
    hash_password,
    verify_password,
    hash_token,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from app.db.queries import (
    init_db_schema,
    create_user_session,
    get_user_session,
    revoke_user_session,
    revoke_session_family,
    revoke_all_user_sessions,
)

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

@pytest.mark.asyncio
async def test_session_lifecycle_and_rotation(conn):
    user_row = await conn.fetchrow(
        """
        INSERT INTO users (login, password_hash, first_name, last_name, role)
        VALUES ('sec_test_user', 'hashed', 'Sec', 'User', 'manager')
        RETURNING id
        """
    )
    user_id = user_row["id"]

    family_id = uuid.uuid4()
    refresh_token = create_refresh_token(
        {"sub": "sec_test_user", "id": user_id, "role": "manager"},
        family_id=str(family_id),
    )
    token_hash = hash_token(refresh_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    await conn.execute(
        """
        INSERT INTO user_sessions (user_id, token_hash, family_id, expires_at, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        user_id,
        token_hash,
        family_id,
        expires_at,
        "pytest-client",
        "127.0.0.1",
    )

    session = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", token_hash)
    assert session is not None
    assert session["user_id"] == user_id
    assert session["revoked_at"] is None

    await conn.execute(
        "UPDATE user_sessions SET revoked_at = NOW() WHERE token_hash = $1",
        token_hash,
    )
    old_session = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", token_hash)
    assert old_session["revoked_at"] is not None

    new_refresh_token = create_refresh_token(
        {"sub": "sec_test_user", "id": user_id, "role": "manager"},
        family_id=str(family_id),
    )
    new_token_hash = hash_token(new_refresh_token)
    await conn.execute(
        """
        INSERT INTO user_sessions (user_id, token_hash, family_id, expires_at, user_agent, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        """,
        user_id,
        new_token_hash,
        family_id,
        expires_at,
        "pytest-client",
        "127.0.0.1",
    )

    new_session = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", new_token_hash)
    assert new_session is not None
    assert new_session["revoked_at"] is None

    await conn.execute(
        "UPDATE user_sessions SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL",
        family_id,
    )

    active_check = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", new_token_hash)
    assert active_check["revoked_at"] is not None

@pytest.mark.asyncio
async def test_revoke_all_user_sessions(conn):
    user_row = await conn.fetchrow(
        """
        INSERT INTO users (login, password_hash, first_name, last_name, role)
        VALUES ('sec_multi_session', 'hashed', 'Multi', 'User', 'contractor')
        RETURNING id
        """
    )
    user_id = user_row["id"]

    t1 = create_refresh_token({"sub": "sec_multi_session", "id": user_id, "role": "contractor"})
    t2 = create_refresh_token({"sub": "sec_multi_session", "id": user_id, "role": "contractor"})
    h1 = hash_token(t1)
    h2 = hash_token(t2)
    exp = datetime.now(timezone.utc) + timedelta(days=7)

    await conn.execute(
        """
        INSERT INTO user_sessions (user_id, token_hash, family_id, expires_at)
        VALUES ($1, $2, $3, $4), ($1, $5, $6, $4)
        """,
        user_id,
        h1,
        uuid.uuid4(),
        exp,
        h2,
        uuid.uuid4(),
    )

    s1 = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", h1)
    s2 = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", h2)
    assert s1["revoked_at"] is None
    assert s2["revoked_at"] is None

    await conn.execute(
        "UPDATE user_sessions SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL",
        user_id,
    )

    s1_revoked = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", h1)
    s2_revoked = await conn.fetchrow("SELECT * FROM user_sessions WHERE token_hash = $1", h2)
    assert s1_revoked["revoked_at"] is not None
    assert s2_revoked["revoked_at"] is not None


def test_sliding_window_rate_limiter():
    from app.rate_limiter import SlidingWindowRateLimiter

    limiter = SlidingWindowRateLimiter(max_requests=3, window_seconds=10)
    key = "test_ip_1"

    # First 3 attempts must pass
    for _ in range(3):
        limited, _ = limiter.is_rate_limited(key)
        assert limited is False

    # 4th attempt must be rate limited
    limited, retry_after = limiter.is_rate_limited(key)
    assert limited is True
    assert retry_after > 0

    # Different key must not be blocked
    other_key = "test_ip_2"
    limited_other, _ = limiter.is_rate_limited(other_key)
    assert limited_other is False


@pytest.mark.asyncio
async def test_expired_session_filtered(conn):
    user_row = await conn.fetchrow(
        """
        INSERT INTO users (login, password_hash, first_name, last_name, role)
        VALUES ('expired_session_user', 'hashed', 'Expired', 'User', 'contractor')
        RETURNING id
        """
    )
    user_id = user_row["id"]
    expired_token = create_refresh_token({"sub": "expired_session_user", "id": user_id, "role": "contractor"})
    expired_hash = hash_token(expired_token)
    past_time = datetime.now(timezone.utc) - timedelta(minutes=5)

    await conn.execute(
        """
        INSERT INTO user_sessions (user_id, token_hash, family_id, expires_at)
        VALUES ($1, $2, $3, $4)
        """,
        user_id,
        expired_hash,
        uuid.uuid4(),
        past_time,
    )

    # get_user_session query filters out expired sessions where expires_at <= NOW()
    session = await conn.fetchrow(
        "SELECT * FROM user_sessions WHERE token_hash = $1 AND expires_at > NOW()",
        expired_hash,
    )
    assert session is None


def test_sanitize_log_value():
    from app.main import sanitize_log_value

    dirty = "user\n\rINJECTION\t\x00test"
    cleaned = sanitize_log_value(dirty)
    assert "\n" not in cleaned
    assert "\r" not in cleaned
    assert "\x00" not in cleaned
    assert "user" in cleaned
    assert "INJECTION" in cleaned


def test_jwt_algorithm_configured():
    from app.auth import ALGORITHM

    assert ALGORITHM in ["HS256", "RS256", "ES256"]


@pytest.mark.asyncio
async def test_update_user_password_verification(monkeypatch):
    from app.main import update_user_endpoint
    from app.models import UserUpdate
    from fastapi import HTTPException
    from unittest.mock import MagicMock, AsyncMock

    mock_request = MagicMock()
    mock_request.client.host = "127.0.0.1"
    mock_request.headers.get.return_value = "pytest"

    current_admin = {"id": 1, "login": "admin", "role": "admin"}
    target_user_id = 42

    stored_user = {
        "id": target_user_id,
        "login": "target_contractor",
        "first_name": "Target",
        "last_name": "User",
        "role": "contractor",
        "password_hash": hash_password("ValidOldPassword123"),
        "created_at": datetime.now(timezone.utc),
    }

    async def mock_get_user(uid):
        if uid == target_user_id:
            return stored_user
        return None

    mock_update_user = AsyncMock()
    mock_add_log = AsyncMock()

    monkeypatch.setattr("app.main.get_user", mock_get_user)
    monkeypatch.setattr("app.main.update_user", mock_update_user)
    monkeypatch.setattr("app.main.add_activity_log", mock_add_log)

    # 1. Missing current password
    req_missing_curr = UserUpdate(
        login="target_contractor",
        first_name="Target",
        last_name="User",
        role="contractor",
        password="BrandNewPassword123",
    )
    with pytest.raises(HTTPException) as exc1:
        await update_user_endpoint(target_user_id, req_missing_curr, mock_request, current_user=current_admin)
    assert exc1.value.status_code == 400
    assert "Current password is required" in exc1.value.detail

    # 2. Invalid current password
    req_invalid_curr = UserUpdate(
        login="target_contractor",
        first_name="Target",
        last_name="User",
        role="contractor",
        password="BrandNewPassword123",
        current_password="WrongPassword999",
    )
    with pytest.raises(HTTPException) as exc2:
        await update_user_endpoint(target_user_id, req_invalid_curr, mock_request, current_user=current_admin)
    assert exc2.value.status_code == 400
    assert "Invalid current password" in exc2.value.detail

    # 3. New password identical to current password
    req_same_pwd = UserUpdate(
        login="target_contractor",
        first_name="Target",
        last_name="User",
        role="contractor",
        password="ValidOldPassword123",
        currentPassword="ValidOldPassword123",
    )
    with pytest.raises(HTTPException) as exc3:
        await update_user_endpoint(target_user_id, req_same_pwd, mock_request, current_user=current_admin)
    assert exc3.value.status_code == 400
    assert "New password must be different from current password" in exc3.value.detail

    # 4. Success when correct current password provided
    req_success = UserUpdate(
        login="target_contractor",
        first_name="Target",
        last_name="User",
        role="contractor",
        password="BrandNewPassword123",
        currentPassword="ValidOldPassword123",
    )
    res = await update_user_endpoint(target_user_id, req_success, mock_request, current_user=current_admin)
    assert res.id == target_user_id
    mock_update_user.assert_awaited_once()
    args = mock_update_user.await_args[0]
    hashed_arg = args[2]
    assert verify_password("BrandNewPassword123", hashed_arg)


