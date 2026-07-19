from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from .db.pool import get_pool
from .db.queries import (
    get_user_by_login,
    get_all_users,
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
    add_task,
    update_task,
    update_task_status,
    delete_task,
    get_activity_logs_filtered,
    add_activity_log,
)
from .auth import hash_password, verify_password
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
    TaskCreate,
    TaskUpdate,
    Task,
    ActivityLog,
)

app = FastAPI(title="Structura API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Login endpoint
@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    user = await get_user_by_login(request.login)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid login or password")
    if not verify_password(request.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid login or password")
    return LoginResponse(
        id=user["id"],
        login=user["login"],
        first_name=user["first_name"],
        last_name=user["last_name"],
        role=user["role"],
    )


# User endpoints
@app.get("/users", response_model=List[User])
async def get_users(role: Optional[str] = None):
    if role == "contractor":
        from .db.queries import get_contractors

        users = await get_contractors()
    else:
        users = await get_all_users()
    return [User(**user) for user in users]


@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    try:
        hashed_password = hash_password(user.password)
        await add_user(
            user.login, hashed_password, user.first_name, user.last_name, user.role
        )
        created_user = await get_user_by_login(user.login)
        return User(**created_user)
    except Exception as e:
        print(f"Error creating user: {e}")
        print(f"User data: {user}")
        raise HTTPException(status_code=422, detail=f"Failed to create user: {str(e)}")


@app.put("/users/{user_id}", response_model=User)
async def update_user_endpoint(user_id: int, user: UserUpdate):
    hashed_password = hash_password(user.password) if user.password else None
    await update_user(
        user_id,
        user.login,
        hashed_password or "",
        user.first_name,
        user.last_name,
        user.role,
    )
    updated_user = await get_user_by_login(user.login)
    return User(**updated_user)


@app.delete("/users/{user_id}")
async def delete_user_endpoint(user_id: int):
    await delete_user(user_id)
    return {"message": "User deleted successfully"}


@app.get("/users/{user_id}/buildings", response_model=List[Building])
async def get_user_buildings(user_id: int):
    buildings = await get_buildings_by_manager(user_id)
    return [Building(**building) for building in buildings]


# Building endpoints
@app.get("/buildings", response_model=List[Building])
async def get_buildings():
    buildings = await get_all_buildings()
    return [Building(**building) for building in buildings]


@app.post("/buildings", response_model=Building)
async def create_building(building: BuildingCreate):
    await add_building(building.city, building.district, building.street_address)
    created_building = await get_building_by_address(
        building.city, building.district, building.street_address
    )
    return Building(**created_building)


@app.put("/buildings/{building_id}", response_model=Building)
async def update_building_endpoint(building_id: int, building: BuildingUpdate):
    await update_building(
        building_id, building.city, building.district, building.street_address
    )
    updated_building = await get_building(building_id)
    return Building(**updated_building)


@app.delete("/buildings/{building_id}")
async def delete_building_endpoint(building_id: int):
    await delete_building(building_id)
    return {"message": "Building deleted successfully"}


# Building manager endpoints
@app.post("/building-managers")
async def add_building_manager_endpoint(manager: BuildingManager):
    await add_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager added successfully"}


@app.delete("/building-managers")
async def delete_building_manager_endpoint(manager: BuildingManager):
    await delete_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager deleted successfully"}


# Task endpoints
@app.get("/tasks")
async def get_tasks():
    from .db.queries import get_all_tasks

    tasks = await get_all_tasks()
    result = []
    for task in tasks:
        task_obj = {
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
                if task["created_by_id"]
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
                if task["assigned_to_id"]
                else None
            ),
            "building": (
                {
                    "id": task["building_id"],
                    "city": task["building_city"],
                    "district": task["building_district"],
                    "street_address": task["building_street_address"],
                }
                if task["building_city"]
                else None
            ),
        }
        result.append(task_obj)
    return result


@app.get("/tasks/{task_id}", response_model=Task)
async def get_task_endpoint(task_id: int):
    task = await get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return Task(**task)


@app.post("/tasks")
async def create_task(task: TaskCreate):
    await add_task(
        task.title,
        task.description,
        task.building_id,
        task.created_by,
        task.assigned_to,
    )
    # Log the creation - get the created task by querying for the latest task by this user
    try:
        created_tasks = await get_all_tasks()
        if created_tasks:
            latest_task = created_tasks[0]
            await add_activity_log(
                latest_task["id"],
                task.created_by,
                "create",
                "Created task",
                {"title": task.title, "description": task.description, "building_id": task.building_id, "assigned_to": task.assigned_to}
            )
    except Exception as e:
        # Log failure shouldn't break task creation
        print(f"Failed to log task creation: {e}")
    return {"message": "Task created successfully"}


@app.put("/tasks/{task_id}")
async def update_task_endpoint(task_id: int, task: TaskUpdate):
    # Get old task state for logging
    old_task = await get_task(task_id)
    
    # Store the user who is making the change for logging
    user_performing_action = task.created_by or (old_task["created_by"] if old_task else None)
    
    await update_task(
        task_id,
        task.title,
        task.description,
        task.building_id,
        task.created_by,
        task.assigned_to,
    )
    
    # Handle status changes separately
    if task.status:
        await update_task_status(task_id, task.status)
    
    updated_task = await get_task(task_id)
    if not updated_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Log the update
    try:
        changes = {}
        if old_task:
            if task.title and task.title != old_task["title"]:
                changes["title"] = {"old": old_task["title"], "new": task.title}
            if task.description is not None and task.description != old_task["description"]:
                changes["description"] = {"old": old_task["description"], "new": task.description}
            if task.building_id and task.building_id != old_task["building_id"]:
                changes["building_id"] = {"old": old_task["building_id"], "new": task.building_id}
            if task.assigned_to and task.assigned_to != old_task["assigned_to"]:
                changes["assigned_to"] = {"old": old_task["assigned_to"], "new": task.assigned_to}
        
        # Determine operation type and action
        if task.status:
            operation_type = "status_change"
            action = f"Changed status to {task.status}"
            changes["status"] = {"old": old_task["status"] if old_task else None, "new": task.status}
        elif changes:
            operation_type = "update"
            action = "Updated task details"
        else:
            operation_type = "update"
            action = "Updated task"
        
        await add_activity_log(
            task_id,
            user_performing_action,
            operation_type,
            action,
            changes if changes else None
        )
    except Exception as e:
        # Log failure shouldn't break task update
        print(f"Failed to log task update: {e}")
    
    task_obj = {
        "id": updated_task["id"],
        "title": updated_task["title"],
        "description": updated_task["description"],
        "building_id": updated_task["building_id"],
        "created_by": updated_task["created_by"],
        "assigned_to": updated_task["assigned_to"],
        "status": updated_task["status"],
        "created_at": updated_task["created_at"],
        "created_by_user": (
            {
                "id": updated_task["created_by_id"],
                "login": updated_task["created_by_login"],
                "first_name": updated_task["created_by_first_name"],
                "last_name": updated_task["created_by_last_name"],
                "role": updated_task["created_by_role"],
            }
            if updated_task["created_by_id"]
            else None
        ),
        "assigned_to_user": (
            {
                "id": updated_task["assigned_to_id"],
                "login": updated_task["assigned_to_login"],
                "first_name": updated_task["assigned_to_first_name"],
                "last_name": updated_task["assigned_to_last_name"],
                "role": updated_task["assigned_to_role"],
            }
            if updated_task["assigned_to_id"]
            else None
        ),
        "building": (
            {
                "id": updated_task["building_id"],
                "city": updated_task["building_city"],
                "district": updated_task["building_district"],
                "street_address": updated_task["building_street_address"],
            }
            if updated_task["building_city"]
            else None
        ),
    }
    return task_obj


@app.delete("/tasks/{task_id}")
async def delete_task_endpoint(task_id: int):
    # Get task info before deletion for logging
    task_to_delete = await get_task(task_id)
    await delete_task(task_id)
    
    # Log the deletion
    try:
        if task_to_delete:
            await add_activity_log(
                task_id,
                task_to_delete.get("created_by"),
                "delete",
                "Deleted task",
                {"title": task_to_delete.get("title"), "status": task_to_delete.get("status")}
            )
    except Exception as e:
        # Log failure shouldn't break task deletion
        print(f"Failed to log task deletion: {e}")
    
    return {"message": "Task deleted successfully"}


# Activity logs endpoints (admin only)
@app.get("/activity-logs")
async def get_activity_logs_endpoint(
    user_id: Optional[int] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    limit: int = 50
):
    import json
    logs = await get_activity_logs_filtered(user_id, start_date, end_date, limit)
    # Parse changes_json from string to dict
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
