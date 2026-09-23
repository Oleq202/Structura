import pytest_asyncio
import asyncpg
import os
from dotenv import load_dotenv
from app.db.queries import init_db_schema

load_dotenv()

_schema_initialized = False

@pytest_asyncio.fixture(autouse=True)
async def setup_test_database():
    """Ensure database schema, indexes, and tables are fully initialized for tests."""
    global _schema_initialized
    if not _schema_initialized:
        await init_db_schema()
        _schema_initialized = True
    yield
