import os
import uuid
import time
import logging
from contextlib import asynccontextmanager
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Header, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from .db.pool import get_pool
from .db.queries import (
    init_db_schema,
    get_user,
    get_user_by_login,
    get_all_users,
    get_contractors,
    add_user,
    update_user,
    delete_user,
    get_building_by_address,
    get_building,
    get_all_buildings,
    get_buildings_by_manager,
    add_building,
    update_building,
    delete_building,
    add_building_manager,
    delete_building_manager,
    get_task,
    get_all_tasks,
    get_task_by_contractor,
    add_task,
    update_task,
    update_task_status,
    delete_task,
    get_activity_logs_filtered,
    add_activity_log,
    get_user_preferences,
    update_user_preferences,
)
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_token,
)
from .models import (
    UserCreate,
    UserUpdate,
    User,
    BuildingCreate,
    BuildingUpdate,
    Building,
    BuildingManager,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    UserPreferences,
    UserPreferencesUpdate,
    TaskCreate,
    TaskUpdate,
    Task,
    ActivityLog,
)
from .worker import start_worker, stop_worker, enqueue_notification

logger = logging.getLogger("structura.api")
logging.basicConfig(
    level=logging.INFO,
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "name": "%(name)s", "message": "%(message)s"}',
)

sentry_dsn = os.getenv("SENTRY_DSN")
if sentry_dsn:
    try:
        import sentry_sdk
        sentry_sdk.init(
            dsn=sentry_dsn,
            traces_sample_rate=1.0,
            profiles_sample_rate=1.0,
        )
        logger.info("Sentry monitoring successfully initialized.")
    except Exception as e:
        logger.warning(f"Sentry SDK initialization skipped: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):

    try:
        await init_db_schema()
    except Exception as e:
        logger.warning(f"Schema initialization warning: {e}")

    await start_worker()
    yield

    await stop_worker()
    pool = await get_pool()
    if pool:
        await pool.close()

app = FastAPI(title="Structura API", lifespan=lifespan)

@app.middleware("http")
async def request_observability_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    start_time = time.time()

    response: Response = await call_next(request)

    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = correlation_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

    if not request.url.path.startswith("/health"):
        logger.info(
            f'request_id="{correlation_id}" method="{request.method}" path="{request.url.path}" status={response.status_code} duration_ms={duration_ms}'
        )

    return response

def get_client_info(request: Request):
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        ip = forwarded.split(",")[0].strip()
    elif request.client:
        ip = request.client.host
    else:
        ip = None
    user_agent = request.headers.get("User-Agent")
    return ip, user_agent

default_origins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

env_origins = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if env_origins:
    origins = [origin.strip() for origin in env_origins.split(",") if origin.strip()] + default_origins
else:
    origins = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    payload = verify_token(token, expected_type="access")
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired access token")
    return payload

def require_role(*allowed_roles):
    def role_checker(current_user=Depends(get_current_user)):
        if current_user.get("role") not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return role_checker

@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Structura API",
        "docs": "/docs",
    }

@app.get("/health/live")
async def health_live():
    return {"status": "alive"}

@app.get("/health/ready")
async def health_ready():
    try:
        pool = await get_pool()
        if pool is None:
            raise HTTPException(status_code=503, detail="Database pool uninitialized")
        async with pool.acquire() as conn:
            await conn.execute("SELECT 1")
        return {"status": "ready", "database": "connected"}
    except Exception:
        raise HTTPException(status_code=503, detail="Database unavailable")

@app.post("/login", response_model=LoginResponse)
async def login(request_body: LoginRequest, request: Request):
    ip, ua = get_client_info(request)
    user = await get_user_by_login(request_body.login)

    if not user or not verify_password(request_body.password, user["password_hash"]):

        await add_activity_log(
            task_id=None,
            user_id=user["id"] if user else None,
            operation_type="login_failed",
            action=f"Failed login attempt for username '{request_body.login}'",
            entity_type="auth",
            entity_id=user["id"] if user else None,
            ip_address=ip,
            user_agent=ua,
        )
        raise HTTPException(status_code=401, detail="Invalid login or password")

    token_data = {"sub": user["login"], "id": user["id"], "role": user["role"]}
    access_token = create_access_token(data=token_data)
    refresh_token = create_refresh_token(data=token_data)

    await add_activity_log(
        task_id=None,
        user_id=user["id"],
        operation_type="login_success",
        action=f"User '{user['login']}' successfully logged in",
        entity_type="auth",
        entity_id=user["id"],
        ip_address=ip,
        user_agent=ua,
    )

    return LoginResponse(
        id=user["id"],
        login=user["login"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
    )

@app.post("/refresh")
async def refresh_token_endpoint(request_body: RefreshTokenRequest):
    payload = verify_token(request_body.refresh_token, expected_type="refresh")
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = await get_user(payload.get("id"))
    if not user:
        raise HTTPException(status_code=401, detail="User no longer exists")

    token_data = {"sub": user["login"], "id": user["id"], "role": user["role"]}
    new_access_token = create_access_token(data=token_data)
    new_refresh_token = create_refresh_token(data=token_data)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }

@app.get("/users/me", response_model=User)
async def get_me(current_user=Depends(get_current_user)):
    user = await get_user(current_user.get("id"))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

@app.get("/users/me/preferences", response_model=UserPreferences)
async def get_my_preferences(current_user=Depends(get_current_user)):
    prefs = await get_user_preferences(current_user.get("id"))
    return UserPreferences(**prefs)

@app.put("/users/me/preferences", response_model=UserPreferences)
async def update_my_preferences(
    prefs: UserPreferencesUpdate, current_user=Depends(get_current_user)
):
    updated = await update_user_preferences(
        user_id=current_user.get("id"),
        language=prefs.language,
        selected_building_ids=prefs.selected_building_ids,
    )
    return UserPreferences(**updated)

@app.get("/users", response_model=List[User])
async def get_users_endpoint(
    role: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user=Depends(require_role("admin", "manager")),
):
    if role == "contractor":
        users = await get_contractors()
    else:
        users = await get_all_users(limit=limit, offset=offset, search=search)
    return [User(**u) for u in users]

@app.post("/users", response_model=User)
async def create_user_endpoint(
    user: UserCreate, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    try:
        hashed_password = hash_password(user.password)
        user_id = await add_user(
            user.login, hashed_password, user.first_name, user.last_name, user.role
        )
        if not user_id:
            raise HTTPException(status_code=400, detail="Failed to create user")

        await add_activity_log(
            task_id=None,
            user_id=current_user.get("id"),
            operation_type="create",
            action=f"Created user '{user.login}' with role '{user.role}'",
            changes_json={"login": {"new": user.login}, "role": {"new": user.role}},
            entity_type="user",
            entity_id=user_id,
            ip_address=ip,
            user_agent=ua,
        )

        created_user = await get_user(user_id)
        return User(**created_user)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=422, detail="User creation failed. Login may already be in use.")

@app.put("/users/{user_id}", response_model=User)
async def update_user_endpoint(
    user_id: int, user: UserUpdate, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    existing = await get_user(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    hashed_password = hash_password(user.password) if user.password else None
    await update_user(
        user_id,
        user.login,
        hashed_password,
        user.first_name,
        user.last_name,
        user.role,
    )

    await add_activity_log(
        task_id=None,
        user_id=current_user.get("id"),
        operation_type="update",
        action=f"Updated user '{existing['login']}'",
        changes_json={"login": {"old": existing["login"], "new": user.login}, "role": {"old": existing["role"], "new": user.role}},
        entity_type="user",
        entity_id=user_id,
        ip_address=ip,
        user_agent=ua,
    )

    updated_user = await get_user(user_id)
    return User(**updated_user)

@app.delete("/users/{user_id}")
async def delete_user_endpoint(
    user_id: int, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    existing = await get_user(user_id)
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")

    await delete_user(user_id)

    await add_activity_log(
        task_id=None,
        user_id=current_user.get("id"),
        operation_type="delete",
        action=f"Deleted user '{existing['login']}'",
        entity_type="user",
        entity_id=user_id,
        ip_address=ip,
        user_agent=ua,
    )

    return {"message": "User deleted successfully"}

@app.get("/users/{user_id}/buildings", response_model=List[Building])
async def get_user_buildings_endpoint(user_id: int, current_user=Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "manager"] and current_user.get("id") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    buildings = await get_buildings_by_manager(user_id)
    return [Building(**b) for b in buildings]

@app.get("/buildings", response_model=List[Building])
async def get_buildings_endpoint(
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user=Depends(get_current_user),
):
    buildings = await get_all_buildings(limit=limit, offset=offset, search=search)
    return [Building(**b) for b in buildings]

@app.post("/buildings", response_model=Building)
async def create_building_endpoint(
    building: BuildingCreate, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    building_id = await add_building(building.city, building.district, building.street_address)
    if not building_id:
        raise HTTPException(status_code=400, detail="Failed to create building")

    await add_activity_log(
        task_id=None,
        user_id=current_user.get("id"),
        operation_type="create",
        action=f"Created building at {building.street_address}, {building.city}",
        changes_json={"city": {"new": building.city}, "address": {"new": building.street_address}},
        entity_type="building",
        entity_id=building_id,
        ip_address=ip,
        user_agent=ua,
    )

    created_building = await get_building(building_id)
    return Building(**created_building)

@app.put("/buildings/{building_id}", response_model=Building)
async def update_building_endpoint(
    building_id: int, building: BuildingUpdate, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    existing = await get_building(building_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Building not found")

    await update_building(building_id, building.city, building.district, building.street_address)

    await add_activity_log(
        task_id=None,
        user_id=current_user.get("id"),
        operation_type="update",
        action=f"Updated building #{building_id} ({building.city})",
        entity_type="building",
        entity_id=building_id,
        ip_address=ip,
        user_agent=ua,
    )

    updated_building = await get_building(building_id)
    return Building(**updated_building)

@app.delete("/buildings/{building_id}")
async def delete_building_endpoint(
    building_id: int, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    existing = await get_building(building_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Building not found")

    await delete_building(building_id)

    await add_activity_log(
        task_id=None,
        user_id=current_user.get("id"),
        operation_type="delete",
        action=f"Deleted building #{building_id} ({existing['street_address']}, {existing['city']})",
        entity_type="building",
        entity_id=building_id,
        ip_address=ip,
        user_agent=ua,
    )

    return {"message": "Building deleted successfully"}

@app.post("/building-managers")
async def add_building_manager_endpoint(
    manager: BuildingManager, current_user=Depends(require_role("admin"))
):
    await add_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager assigned successfully"}

@app.delete("/building-managers")
async def delete_building_manager_endpoint(
    manager: BuildingManager, current_user=Depends(require_role("admin"))
):
    await delete_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager removed successfully"}

def _format_task_dict(task: dict) -> dict:
    return {
        "id": task["id"],
        "title": task["title"],
        "description": task["description"],
        "building_id": task["building_id"],
        "created_by": task["created_by"],
        "assigned_to": task["assigned_to"],
        "status": task["status"],
        "created_at": task["created_at"],
        "created_by_user": (
            {
                "id": task["created_by_id"],
                "login": task["created_by_login"],
                "first_name": task["created_by_first_name"],
                "last_name": task["created_by_last_name"],
                "role": task["created_by_role"],
            }
            if task.get("created_by_id")
            else None
        ),
        "assigned_to_user": (
            {
                "id": task["assigned_to_id"],
                "login": task["assigned_to_login"],
                "first_name": task["assigned_to_first_name"],
                "last_name": task["assigned_to_last_name"],
                "role": task["assigned_to_role"],
            }
            if task.get("assigned_to_id")
            else None
        ),
        "building": (
            {
                "id": task["building_id"],
                "city": task.get("building_city"),
                "district": task.get("building_district"),
                "street_address": task.get("building_street_address"),
            }
            if task.get("building_city")
            else None
        ),
    }

@app.get("/tasks")
async def get_tasks_endpoint(
    building_id: Optional[int] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    current_user=Depends(get_current_user),
):
    if current_user.get("role") == "contractor":
        tasks = await get_task_by_contractor(
            user_id=current_user.get("id"),
            status=status,
            limit=limit,
            offset=offset,
        )
    else:
        tasks = await get_all_tasks(
            building_id=building_id,
            status=status,
            search=search,
            limit=limit,
            offset=offset,
        )

    return [_format_task_dict(task) for task in tasks]

@app.get("/tasks/{task_id}")
async def get_task_endpoint(task_id: int, current_user=Depends(get_current_user)):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.get("role") == "contractor" and task["assigned_to"] != current_user.get("id"):
        raise HTTPException(status_code=403, detail="Forbidden: You can only view your assigned tasks")

    return _format_task_dict(task)

@app.post("/tasks")
async def create_task_endpoint(
    task: TaskCreate, request: Request, current_user=Depends(require_role("admin", "manager"))
):
    ip, ua = get_client_info(request)
    task_id = await add_task(
        task.title,
        task.description,
        task.building_id,
        task.created_by,
        task.assigned_to,
    )
    if not task_id:
        raise HTTPException(status_code=400, detail="Failed to create task")

    try:
        await add_activity_log(
            task_id=task_id,
            user_id=current_user.get("id"),
            operation_type="create",
            action="Created task",
            changes_json={
                "title": {"new": task.title},
                "description": {"new": task.description},
                "building_id": {"new": task.building_id},
                "assigned_to": {"new": task.assigned_to},
            },
            entity_type="task",
            entity_id=task_id,
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as e:
        logger.warning(f"Failed to log task creation: {e}")

    if task.assigned_to:
        assigned_contractor = await get_user(task.assigned_to)
        if assigned_contractor:
            await enqueue_notification(
                event_type="task_assignment",
                recipient=assigned_contractor["login"],
                message=f"You have been assigned new task: '{task.title}'",
                payload={"task_id": task_id, "title": task.title},
            )

    created_task = await get_task(task_id)
    return _format_task_dict(created_task)

@app.put("/tasks/{task_id}")
async def update_task_endpoint(
    task_id: int, task: TaskUpdate, request: Request, current_user=Depends(require_role("admin", "manager"))
):
    ip, ua = get_client_info(request)
    old_task = await get_task(task_id)
    if not old_task:
        raise HTTPException(status_code=404, detail="Task not found")

    user_performing_action = current_user.get("id")

    await update_task(
        task_id,
        task.title,
        task.description,
        task.building_id,
        task.created_by,
        task.assigned_to,
    )

    if task.status:
        await update_task_status(task_id, task.status)

    updated_task = await get_task(task_id)

    try:
        changes = {}
        if task.title and task.title != old_task["title"]:
            changes["title"] = {"old": old_task["title"], "new": task.title}
        if task.description is not None and task.description != old_task["description"]:
            changes["description"] = {"old": old_task["description"], "new": task.description}
        if task.building_id and task.building_id != old_task["building_id"]:
            changes["building_id"] = {"old": old_task["building_id"], "new": task.building_id}
        if task.assigned_to and task.assigned_to != old_task["assigned_to"]:
            changes["assigned_to"] = {"old": old_task["assigned_to"], "new": task.assigned_to}

        if task.status:
            op_type = "status_change"
            action = f"Changed status to {task.status}"
            changes["status"] = {"old": old_task["status"], "new": task.status}
        else:
            op_type = "update"
            action = "Updated task details"

        await add_activity_log(
            task_id=task_id,
            user_id=user_performing_action,
            operation_type=op_type,
            action=action,
            changes_json=changes if changes else None,
            entity_type="task",
            entity_id=task_id,
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as e:
        logger.warning(f"Failed to log task update: {e}")

    if task.assigned_to and task.assigned_to != old_task.get("assigned_to"):
        assigned_contractor = await get_user(task.assigned_to)
        if assigned_contractor:
            await enqueue_notification(
                event_type="task_reassignment",
                recipient=assigned_contractor["login"],
                message=f"You have been reassigned to task: '{updated_task.get('title')}'",
                payload={"task_id": task_id, "title": updated_task.get("title")},
            )

    return _format_task_dict(updated_task)

@app.delete("/tasks/{task_id}")
async def delete_task_endpoint(
    task_id: int, request: Request, current_user=Depends(require_role("admin"))
):
    ip, ua = get_client_info(request)
    task_to_delete = await get_task(task_id)
    if not task_to_delete:
        raise HTTPException(status_code=404, detail="Task not found")

    await delete_task(task_id)

    try:
        await add_activity_log(
            task_id=task_id,
            user_id=current_user.get("id"),
            operation_type="delete",
            action="Deleted task",
            changes_json={
                "title": {"old": task_to_delete.get("title")},
                "status": {"old": task_to_delete.get("status")},
            },
            entity_type="task",
            entity_id=task_id,
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as e:
        logger.warning(f"Failed to log task deletion: {e}")

    return {"message": "Task deleted successfully"}

@app.put("/tasks/{task_id}/status")
async def update_task_status_endpoint(
    task_id: int, status_data: dict, request: Request, current_user=Depends(get_current_user)
):
    ip, ua = get_client_info(request)
    status = status_data.get("status")
    if not status:
        raise HTTPException(status_code=400, detail="Missing status field")

    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.get("role") == "contractor" and task["assigned_to"] != current_user.get("id"):
        raise HTTPException(
            status_code=403, detail="You can only update status of tasks assigned to you"
        )

    await update_task_status(task_id, status)

    try:
        await add_activity_log(
            task_id=task_id,
            user_id=current_user.get("id"),
            operation_type="status_change",
            action=f"Changed status to {status}",
            changes_json={"status": {"old": task["status"], "new": status}},
            entity_type="task",
            entity_id=task_id,
            ip_address=ip,
            user_agent=ua,
        )
    except Exception as e:
        logger.warning(f"Failed to log status change: {e}")

    if status == "completed" and task.get("created_by"):
        creator = await get_user(task["created_by"])
        if creator:
            await enqueue_notification(
                event_type="task_completed",
                recipient=creator["login"],
                message=f"Task '{task['title']}' has been marked as completed.",
                payload={"task_id": task_id, "status": status},
            )

    return {"message": "Task status updated successfully"}

@app.get("/activity-logs")
async def get_activity_logs_endpoint(
    user_id: Optional[int] = None,
    entity_type: Optional[str] = None,
    operation_type: Optional[str] = None,
    search: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50,
    current_user=Depends(require_role("admin")),
):
    import json

    logs = await get_activity_logs_filtered(
        user_id=user_id,
        entity_type=entity_type,
        operation_type=operation_type,
        search=search,
        start_date=start_date,
        end_date=end_date,
        limit=limit,
    )
    parsed_logs = []
    for log in logs:
        log_dict = dict(log)
        if log_dict.get("changes_json") and isinstance(log_dict["changes_json"], str):
            try:
                log_dict["changes_json"] = json.loads(log_dict["changes_json"])
            except (json.JSONDecodeError, TypeError):
                log_dict["changes_json"] = None
        parsed_logs.append(ActivityLog(**log_dict))
    return parsed_logs

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
