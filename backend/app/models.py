from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class UserBase(BaseModel):
    login: str
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    role: Literal["admin", "manager", "contractor"]


class UserCreate(UserBase):
    password: str

    class Config:
        extra = "allow"


class UserUpdate(UserBase):
    password: Optional[str] = None


class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True


class BuildingBase(BaseModel):
    city: str
    district: Optional[str] = None
    street_address: str = Field(alias="streetAddress")


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
    login: str
    password: str


class LoginResponse(BaseModel):
    id: int
    login: str
    first_name: str = Field(alias="firstName")
    last_name: str = Field(alias="lastName")
    role: str

    class Config:
        populate_by_name = True


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    building_id: int
    created_by: int
    assigned_to: int


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    building_id: Optional[int] = None
    created_by: Optional[int] = None
    assigned_to: Optional[int] = None
    status: Optional[str] = None


class Task(TaskBase):
    id: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
