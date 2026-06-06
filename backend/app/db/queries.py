from __future__ import annotations
from .pool import get_pool

# Internal helper functions


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


# Users


async def get_user(user_id: int):
    query = "select * from users where id = $1"
    return await _fetch_row(query, user_id)


async def get_user_by_login(login: str):
    query = "select * from users where login = $1"
    return await _fetch_row(query, login)


async def get_contractors():
    query = (
        "select * from users where role = 'contractor' order by last_name, first_name"
    )
    return await _fetch_rows(query)


async def add_user(
    login: str, password: str, first_name: str, last_name: str, role: str
):
    query = "insert into users (login, password_hash, first_name, last_name, role) values ($1, $2, $3, $4, $5)"
    await _execute(query, login, password, first_name, last_name, role)


async def delete_user(user_id: int):
    query = "delete from users where id = $1"
    await _execute(query, user_id)


async def update_user(
    user_id: int, login: str, password: str, first_name: str, last_name: str, role: str
):
    query = "update users set login = $2, password_hash = $3, first_name = $4, last_name = $5, role = $6 where id = $1"
    await _execute(query, user_id, login, password, first_name, last_name, role)


# Buildings


async def get_building(building_id: int):
    query = "select * from buildings where id = $1"
    return await _fetch_row(query, building_id)


async def get_building_by_address(city: str, district: str | None, street_address: str):
    query = "select * from buildings where city = $1 and district is not distinct from $2 and street_address = $3"
    return await _fetch_row(query, city, district, street_address)


async def get_all_buildings():
    query = "select * from buildings order by city, district, street_address"
    return await _fetch_rows(query)


async def get_buildings_by_manager(user_id: int):
    query = "select b.* from buildings b left join building_managers bm on b.id = bm.building_id where bm.user_id = $1 order by city, district, street_address"
    return await _fetch_rows(query, user_id)


async def add_building(city: str, district: str | None, street_address: str):
    query = "insert into buildings (city, district, street_address) values ($1, $2, $3)"
    await _execute(query, city, district, street_address)


async def update_building(
    building_id: int, city: str, district: str | None, street_address: str
):
    query = "update buildings set city = $2, district = $3, street_address = $4 where id = $1"
    await _execute(query, building_id, city, district, street_address)


async def delete_building(building_id: int):
    query = "delete from buildings where id = $1"
    await _execute(query, building_id)


# Tasks


async def get_task(task_id: int):
    query = "select * from tasks where id = $1"
    return await _fetch_row(query, task_id)


async def get_task_by_contractor(user_id: int):
    query = "select * from tasks where assigned_to = $1 order by created_at desc"
    return await _fetch_rows(query, user_id)


async def get_pending_tasks_by_user(user_id: int, role: str, limit: int = 10):
    if role == "admin":
        query = "select * from tasks where status = 'pending' order by created_at desc limit $1"
        return await _fetch_rows(query, limit)

    query = """select t.* from tasks t
        join building_managers bm on t.building_id = bm.building_id
        where bm.user_id = $1 and t.status = 'pending' order by t.created_at desc limit $2"""
    return await _fetch_rows(query, user_id, limit)


async def get_completed_tasks_by_user(user_id: int, role: str, limit: int = 10):
    if role == "admin":
        query = "select * from tasks where status = 'completed' order by created_at desc limit $1"
        return await _fetch_rows(query, limit)

    query = """select t.* from tasks t
        join building_managers bm on t.building_id = bm.building_id
        where bm.user_id = $1 and t.status = 'completed' order by t.created_at desc limit $2"""
    return await _fetch_rows(query, user_id, limit)


async def add_task(
    title: str,
    description: str | None,
    building_id: int,
    created_by: int,
    assigned_to: int,
):
    query = "insert into tasks (title, description, building_id, created_by, assigned_to) values ($1, $2, $3, $4, $5)"
    await _execute(query, title, description, building_id, created_by, assigned_to)


async def update_task(
    task_id: int,
    title: str | None,
    description: str | None,
    building_id: int | None,
    created_by: int | None,
    assigned_to: int | None,
):
    query = "update tasks set title = $2, description = $3, building_id = $4, created_by = $5, assigned_to = $6 where id = $1"
    await _execute(
        query, task_id, title, description, building_id, created_by, assigned_to
    )


async def update_task_status(task_id: int, status: str):
    query = "update tasks set status = $2 where id = $1"
    await _execute(query, task_id, status)


async def delete_task(task_id: int):
    query = "delete from tasks where id = $1"
    await _execute(query, task_id)


# Activity logs


async def get_activity_logs(limit: int = 10):
    query = "select * from activity_logs order by timestamp desc limit $1"
    return await _fetch_rows(query, limit)


async def get_activity_logs_by_task(task_id: int):
    query = "select * from activity_logs where task_id = $1 order by timestamp asc"
    return await _fetch_rows(query, task_id)


async def add_activity_log(task_id: int, user_id: int | None, action: str):
    query = "insert into activity_logs (task_id, user_id, action) values ($1, $2, $3)"
    await _execute(query, task_id, user_id, action)


# Building managers


async def get_manager_for_building(building_id: int):
    query = """select u.* from users u
        join building_managers bm on u.id = bm.user_id
        where bm.building_id = $1"""
    return await _fetch_row(query, building_id)


async def get_building_for_manager(user_id: int):
    query = """select b.* from buildings b
        join building_managers bm on b.id = bm.building_id
        where bm.user_id = $1"""
    return await _fetch_row(query, user_id)


async def add_building_manager(building_id: int, user_id: int):
    query = "insert into building_managers (building_id, user_id) values ($1, $2)"
    await _execute(query, building_id, user_id)


async def delete_building_manager(building_id: int, user_id: int):
    query = "delete from building_managers where building_id = $1 and user_id = $2"
    await _execute(query, building_id, user_id)
