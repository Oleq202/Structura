from pydantic import BaseModel, Field
from typing import Optional, List, Literal, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    login: str = Field(min_length=1, max_length=64)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    role: Literal["admin", "manager", "contractor"]

class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=128)

    class Config:
        extra = "forbid"

class UserUpdate(UserBase):
    password: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class BuildingBase(BaseModel):
    city: str = Field(min_length=1, max_length=200)
    district: Optional[str] = Field(default=None, max_length=200)
    street_address: str = Field(min_length=1, max_length=200)

class BuildingCreate(BuildingBase):
    pass

class BuildingUpdate(BuildingBase):
    pass

class Building(BuildingBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True

class BuildingManager(BaseModel):
    user_id: int
    building_id: int

class LoginRequest(BaseModel):
    login: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=128)

class LoginResponse(BaseModel):
    id: int
    login: str
    first_name: str
    last_name: str
    role: str
    access_token: str
    token_type: str = "bearer"

    class Config:
        populate_by_name = True

class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=5, max_length=128)


class UserPreferences(BaseModel):
    user_id: int
    language: str = "pl"
    selected_building_ids: List[int] = []

    class Config:
        from_attributes = True
        populate_by_name = True

class UserPreferencesUpdate(BaseModel):
    language: Optional[str] = Field(default=None, max_length=10)
    selected_building_ids: Optional[List[int]] = None

class UserNested(BaseModel):
    id: int
    login: str
    first_name: str
    last_name: str
    role: str

    class Config:
        from_attributes = True
        populate_by_name = True

class BuildingNested(BaseModel):
    id: int
    city: str
    district: Optional[str] = None
    street_address: str

    class Config:
        from_attributes = True
        populate_by_name = True

class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=5000)
    building_id: int
    created_by: int
    assigned_to: int

class TaskCreate(TaskBase):
    pass

class TaskStatusUpdate(BaseModel):
    status: Literal["pending", "completed"]

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    building_id: Optional[int] = None
    assigned_to: Optional[int] = None
    status: Optional[Literal["pending", "completed"]] = None

class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    building_id: int
    created_by: int
    assigned_to: int
    status: str
    created_at: datetime
    created_by_id: Optional[int] = None
    created_by_login: Optional[str] = None
    created_by_first_name: Optional[str] = None
    created_by_last_name: Optional[str] = None
    created_by_role: Optional[str] = None
    assigned_to_id: Optional[int] = None
    assigned_to_login: Optional[str] = None
    assigned_to_first_name: Optional[str] = None
    assigned_to_last_name: Optional[str] = None
    assigned_to_role: Optional[str] = None
    building_city: Optional[str] = None
    building_district: Optional[str] = None
    building_street_address: Optional[str] = None

    @property
    def created_by_user(self):
        if self.created_by_id:
            return {
                "id": self.created_by_id,
                "login": self.created_by_login,
                "first_name": self.created_by_first_name,
                "last_name": self.created_by_last_name,
                "role": self.created_by_role,
            }
        return None

    @property
    def assigned_to_user(self):
        if self.assigned_to_id:
            return {
                "id": self.assigned_to_id,
                "login": self.assigned_to_login,
                "first_name": self.assigned_to_first_name,
                "last_name": self.assigned_to_last_name,
                "role": self.assigned_to_role,
            }
        return None

    @property
    def building_obj(self):
        if self.building_city:
            return {
                "id": self.building_id,
                "city": self.building_city,
                "district": self.building_district,
                "street_address": self.building_street_address,
            }
        return None

    class Config:
        from_attributes = True
        populate_by_name = True

class ActivityLogBase(BaseModel):
    task_id: Optional[int] = None
    user_id: Optional[int] = None
    operation_type: str
    action: str
    changes_json: Optional[Dict[str, Any]] = None
    entity_type: Optional[str] = "task"
    entity_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class ActivityLogCreate(ActivityLogBase):
    pass

class ActivityLog(ActivityLogBase):
    id: int
    timestamp: datetime
    user_id: Optional[int] = None
    user_login: Optional[str] = None
    user_first_name: Optional[str] = None
    user_last_name: Optional[str] = None
    user_role: Optional[str] = None
    task_title: Optional[str] = None
    task_status: Optional[str] = None
    building_city: Optional[str] = None
    building_district: Optional[str] = None
    building_street_address: Optional[str] = None
    entity_type: Optional[str] = "task"
    entity_id: Optional[int] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    @property
    def user(self):
        if self.user_login:
            return {
                "id": self.user_id,
                "login": self.user_login,
                "first_name": self.user_first_name,
                "last_name": self.user_last_name,
                "role": self.user_role,
            }
        return None

    @property
    def task(self):
        if self.task_title:
            return {
                "id": self.task_id,
                "title": self.task_title,
                "status": self.task_status,
                "building": {
                    "city": self.building_city,
                    "district": self.building_district,
                    "street_address": self.building_street_address,
                } if self.building_city else None,
            }
        return None

    class Config:
        from_attributes = True
        populate_by_name = True
