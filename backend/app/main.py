from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

from .db.pool import get_pool
from .db.queries import (
    get_user_by_login,
    add_user,
    update_user,
    delete_user,
    get_building_by_address,
    get_building,
    get_all_buildings,
    add_building,
    update_building,
    delete_building,
    add_building_manager,
    delete_building_manager,
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
@app.post("/users", response_model=User)
async def create_user(user: UserCreate):
    hashed_password = hash_password(user.password)
    await add_user(
        user.login, hashed_password, user.first_name, user.last_name, user.role
    )
    created_user = await get_user_by_login(user.login)
    return User(**created_user)


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


# Building endpoints
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
@app.post("/buildings/{building_id}/managers/{user_id}")
async def add_building_manager_endpoint(manager: BuildingManager):
    await add_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager added successfully"}


@app.delete("/buildings/{building_id}/managers/{user_id}")
async def delete_building_manager_endpoint(manager: BuildingManager):
    await delete_building_manager(manager.building_id, manager.user_id)
    return {"message": "Building manager deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
