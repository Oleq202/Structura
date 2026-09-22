import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        dsn = os.getenv("DATABASE_URL")
        min_size = int(os.getenv("DB_POOL_MIN_SIZE", "2"))
        max_size = int(os.getenv("DB_POOL_MAX_SIZE", "10"))
        command_timeout = float(os.getenv("DB_COMMAND_TIMEOUT", "30.0"))

        _pool = await asyncpg.create_pool(
            dsn=dsn,
            ssl="require",
            min_size=min_size,
            max_size=max_size,
            command_timeout=command_timeout,
            statement_cache_size=0,
        )
    return _pool

async def close_pool():
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None

async def is_pool_healthy() -> bool:
    try:
        pool = await get_pool()
        if pool is None:
            return False
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception:
        return False
